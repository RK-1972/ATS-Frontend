import { useCallback, useRef, useState } from "react";

import candidateRepository from "@/repositories/candidateRepository";
import {
  buildBulkSourceReference,
  createBulkBatchId,
  formatDuplicateCandidateLabel,
  formatParsedCandidateName
} from "@/utils/candidateBulkIntakeUtils";

function createQueuedItem(file, index) {
  return {
    id: `${file.name}-${file.size}-${index}`,
    file,
    fileName: file.name,
    fileIndex: index,
    status: "queued",
    intakeId: null,
    candidateId: null,
    candidateName: "",
    candidateCode: "",
    message: "",
    failureStep: null
  };
}

function resolveFailureMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

async function processBulkIntakeFile({
  file,
  fileIndex,
  batchId,
  sourceId
}) {
  const intake = await candidateRepository.createCandidateIntake({
    source_id: sourceId,
    original_file_name: file.name,
    source_reference: buildBulkSourceReference(batchId, fileIndex)
  });

  const intakeId = intake?.intake_id;

  if (!intakeId) {
    throw Object.assign(new Error("Intake record was not created."), {
      failureStep: "create"
    });
  }

  try {
    await candidateRepository.processCandidateIntakeResume(intakeId, file);
  } catch (error) {
    error.failureStep = "process";
    error.intakeId = intakeId;
    throw error;
  }

  try {
    const parseResponse =
      await candidateRepository.parseCandidateIntakeResume(intakeId);

    if (parseResponse?.outcome === "DUPLICATE") {
      const duplicateCandidate = parseResponse.duplicate_candidate || null;

      return {
        status: "duplicate",
        intakeId,
        candidateId: duplicateCandidate?.candidate_id || null,
        candidateName: formatDuplicateCandidateLabel(duplicateCandidate),
        candidateCode: duplicateCandidate?.candidate_code || "",
        message:
          duplicateCandidate?.candidate_code
            ? `Matches existing candidate ${duplicateCandidate.candidate_code}.`
            : "Matches an existing candidate by email.",
        failureStep: null
      };
    }

    const parsedCandidate = parseResponse?.parsed_candidate || null;
    const candidateName = formatParsedCandidateName(parsedCandidate);

    return {
      status: "parsed",
      intakeId,
      candidateId: parseResponse?.draft_candidate_id || null,
      candidateName,
      candidateCode: "",
      message: "Ready for Review.",
      failureStep: null
    };
  } catch (error) {
    error.failureStep = "parse";
    error.intakeId = intakeId;
    throw error;
  }
}

async function retryBulkIntakeFile(item, { sourceId, batchId }) {
  if (!item?.file) {
    throw new Error("Original file is unavailable for retry.");
  }

  if (item.failureStep === "create" || !item.intakeId) {
    return processBulkIntakeFile({
      file: item.file,
      fileIndex: item.fileIndex,
      batchId,
      sourceId
    });
  }

  if (item.failureStep === "process") {
    try {
      await candidateRepository.processCandidateIntakeResume(
        item.intakeId,
        item.file
      );
    } catch (error) {
      error.failureStep = "process";
      error.intakeId = item.intakeId;
      throw error;
    }
  }

  try {
    const parseResponse =
      await candidateRepository.parseCandidateIntakeResume(item.intakeId);

    if (parseResponse?.outcome === "DUPLICATE") {
      const duplicateCandidate = parseResponse.duplicate_candidate || null;

      return {
        status: "duplicate",
        intakeId: item.intakeId,
        candidateId: duplicateCandidate?.candidate_id || null,
        candidateName: formatDuplicateCandidateLabel(duplicateCandidate),
        candidateCode: duplicateCandidate?.candidate_code || "",
        message:
          duplicateCandidate?.candidate_code
            ? `Matches existing candidate ${duplicateCandidate.candidate_code}.`
            : "Matches an existing candidate by email.",
        failureStep: null
      };
    }

    const parsedCandidate = parseResponse?.parsed_candidate || null;

    return {
      status: "parsed",
      intakeId: item.intakeId,
      candidateId: parseResponse?.draft_candidate_id || null,
      candidateName: formatParsedCandidateName(parsedCandidate),
      candidateCode: "",
      message: "Ready for Review.",
      failureStep: null
    };
  } catch (error) {
    error.failureStep = "parse";
    error.intakeId = item.intakeId;
    throw error;
  }
}

function useBulkCandidateIntake() {
  const [items, setItems] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [batchId, setBatchId] = useState("");
  const cancelRef = useRef(false);

  const resetBulkSession = useCallback(() => {
    cancelRef.current = false;
    setItems([]);
    setProcessing(false);
    setBatchId("");
  }, []);

  const runSequentialBatch = useCallback(
    async ({ files, sourceId, onFileComplete }) => {
      const nextBatchId = createBulkBatchId();
      const queuedItems = files.map((file, index) => createQueuedItem(file, index));

      cancelRef.current = false;
      setBatchId(nextBatchId);
      setItems(queuedItems);
      setProcessing(true);

      const completedItems = [];

      for (let index = 0; index < queuedItems.length; index += 1) {
        if (cancelRef.current) {
          break;
        }

        const currentItem = queuedItems[index];

        setItems((previousItems) =>
          previousItems.map((entry, entryIndex) =>
            entryIndex === index
              ? { ...entry, status: "processing", message: "Processing..." }
              : entry
          )
        );

        try {
          const result = await processBulkIntakeFile({
            file: currentItem.file,
            fileIndex: currentItem.fileIndex,
            batchId: nextBatchId,
            sourceId
          });

          const completedItem = {
            ...currentItem,
            ...result
          };

          completedItems.push(completedItem);

          setItems((previousItems) =>
            previousItems.map((entry, entryIndex) =>
              entryIndex === index ? completedItem : entry
            )
          );
        } catch (error) {
          const failedItem = {
            ...currentItem,
            status: "failed",
            intakeId: error.intakeId || currentItem.intakeId || null,
            message: resolveFailureMessage(
              error,
              "Failed to process this resume."
            ),
            failureStep: error.failureStep || "parse"
          };

          completedItems.push(failedItem);

          setItems((previousItems) =>
            previousItems.map((entry, entryIndex) =>
              entryIndex === index ? failedItem : entry
            )
          );
        }

        onFileComplete?.(completedItems[index] || null);
      }

      setProcessing(false);
      return completedItems;
    },
    []
  );

  const retryFailedItem = useCallback(
    async ({ item, sourceId, onFileComplete }) => {
      if (!item || item.status !== "failed") {
        return null;
      }

      const activeBatchId = batchId || createBulkBatchId();

      setProcessing(true);

      setItems((previousItems) =>
        previousItems.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: "processing", message: "Retrying..." }
            : entry
        )
      );

      try {
        const result = await retryBulkIntakeFile(item, {
          sourceId,
          batchId: activeBatchId
        });

        const completedItem = {
          ...item,
          ...result
        };

        setItems((previousItems) =>
          previousItems.map((entry) =>
            entry.id === item.id ? completedItem : entry
          )
        );

        onFileComplete?.(completedItem);
        return completedItem;
      } catch (error) {
        const failedItem = {
          ...item,
          status: "failed",
          intakeId: error.intakeId || item.intakeId || null,
          message: resolveFailureMessage(error, "Retry failed."),
          failureStep: error.failureStep || item.failureStep || "parse"
        };

        setItems((previousItems) =>
          previousItems.map((entry) =>
            entry.id === item.id ? failedItem : entry
          )
        );

        onFileComplete?.(failedItem);
        return failedItem;
      } finally {
        setProcessing(false);
      }
    },
    [batchId]
  );

  return {
    items,
    processing,
    batchId,
    runSequentialBatch,
    retryFailedItem,
    resetBulkSession
  };
}

export default useBulkCandidateIntake;
