import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Grid,
  LinearProgress,
  Stack,
  Typography
} from "@mui/material";
import PreviewOutlinedIcon from "@mui/icons-material/PreviewOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";

import EnterpriseCard from "@/components/enterprise/framework/EnterpriseCard";
import EnterpriseConfirmationDialog from "@/components/enterprise/EnterpriseConfirmationDialog";
import { StatusChip } from "@/components/enterprise";
import offerLetterRepository from "@/repositories/offerLetterRepository";
import { resolveGeneratedOfferDocumentUrl } from "@/utils/resolveGeneratedOfferDocumentUrl";
import { formatApprovedDate } from "@/utils/offerLetterUtils";

import OfferCompensationSection from "./OfferCompensationSection";
import OfferLetterPreviewDialog from "./OfferLetterPreviewDialog";
import OfferCommercialSummaryFields from "@/components/offers/OfferCommercialSummaryFields";

function SummaryField({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function OfferLetterWorkspacePanel({
  offerId,
  readOnly = false,
  onGenerate,
  onGenerated
}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!offerId) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setErrorMessage("");

    offerLetterRepository
      .getDetail(offerId)
      .then((offerDetail) => {
        if (!cancelled) {
          setDetail(offerDetail);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMessage(
            error?.response?.data?.message || "Unable to load offer letter details."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [offerId]);

  const isGeneratedLetter =
    String(detail?.letterStatus || "") === "Letter Generated" &&
    Boolean(detail?.pdfGenerated || detail?.pdfPath);

  const pdfPending = Boolean(detail?.pdfPending);

  const pdfViewerUrl = isGeneratedLetter
    ? resolveGeneratedOfferDocumentUrl(detail.offerId)
    : "";

  const pdfDownloadUrl = isGeneratedLetter
    ? resolveGeneratedOfferDocumentUrl(detail.offerId, { download: true })
    : "";

  const handleDownloadPdf = () => {
    if (!pdfDownloadUrl) {
      return;
    }

    window.open(pdfDownloadUrl, "_blank", "noopener,noreferrer");
  };

  const handlePreviewPdf = () => {
    if (!pdfViewerUrl) {
      return;
    }

    window.open(pdfViewerUrl, "_blank", "noopener,noreferrer");
  };

  const handleGenerate = async () => {
    if (!offerId) {
      return;
    }

    try {
      setGenerating(true);
      const result = await onGenerate?.(offerId);
      setConfirmOpen(false);
      onGenerated?.(result);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to generate offer letter PDF."
      );
    } finally {
      setGenerating(false);
    }
  };

  if (!offerId) {
    return (
      <EnterpriseCard>
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
            Select an offer from the queue and click Open to begin letter generation
          </Typography>
        </Box>
      </EnterpriseCard>
    );
  }

  if (loading) {
    return (
      <EnterpriseCard>
        <Typography variant="body2" color="text.secondary">
          Loading offer letter details...
        </Typography>
      </EnterpriseCard>
    );
  }

  if (!detail) {
    return (
      <EnterpriseCard>
        <Alert severity="error">
          {errorMessage || "Offer letter details are unavailable."}
        </Alert>
      </EnterpriseCard>
    );
  }

  return (
    <>
      <Stack spacing={1.5}>
        {generating ? (
          <Box>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
              Generating offer letter...
            </Typography>
          </Box>
        ) : null}

        {pdfPending ? (
          <Alert severity="error">
            PDF generation failed for this offer letter. Please regenerate to download the PDF.
          </Alert>
        ) : null}

        {errorMessage ? (
          <Alert severity="error" onClose={() => setErrorMessage("")}>
            {errorMessage}
          </Alert>
        ) : null}

        <EnterpriseCard
          title="Offer Summary"
          subtitle={`${detail.offerNumber} · ${detail.requisitionCode || "—"}`}
          actions={<StatusChip status={detail.letterStatus || "Awaiting Letter"} />}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryField label="Candidate" value={detail.candidateName} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryField label="Offer Number" value={detail.offerNumber} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryField label="Requisition" value={detail.requisitionCode} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryField label="Position" value={detail.position} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryField label="Department" value={detail.department} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryField label="Business Unit" value={detail.businessUnit} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryField label="Location" value={detail.location} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryField
                label="Joining Date"
                value={formatApprovedDate(detail.joiningDate)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryField
                label="Reporting Manager"
                value={detail.reportingManager}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryField label="Recruiter" value={detail.recruiter} />
            </Grid>
            <OfferCommercialSummaryFields offer={detail} />
          </Grid>
        </EnterpriseCard>

        <OfferCompensationSection
          approvedAnnualCtc={detail.annualCtc || 0}
          compensation={{
            structureName: detail.structureName,
            ctcBreakup: detail.ctcBreakup,
            gross: detail.gross,
            totalCtc: detail.totalCtc,
            calculatedOn: detail.calculatedOn,
            calculatedBy: detail.calculatedBy
          }}
        />

        <EnterpriseCard
          title="Generated Offer Letter"
          subtitle={
            isGeneratedLetter
              ? "Preview or download the generated offer letter PDF"
              : "Generate the offer letter PDF from the approved CTC"
          }
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {isGeneratedLetter ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={<PreviewOutlinedIcon />}
                  onClick={handlePreviewPdf}
                  disabled={!pdfViewerUrl}
                  sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
                >
                  Preview
                </Button>

                <Button
                  variant="contained"
                  startIcon={<DownloadOutlinedIcon />}
                  onClick={handleDownloadPdf}
                  disabled={!pdfDownloadUrl}
                  sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
                >
                  Download
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<PreviewOutlinedIcon />}
                  onClick={() => setPreviewOpen(true)}
                  sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
                >
                  Preview
                </Button>

                {!readOnly && !isGeneratedLetter ? (
                  <Button
                    variant="contained"
                    startIcon={<ArticleOutlinedIcon />}
                    disabled={!detail?.annualCtc || generating}
                    onClick={() => setConfirmOpen(true)}
                    sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
                  >
                    Generate Offer Letter
                  </Button>
                ) : null}
              </>
            )}
          </Stack>
        </EnterpriseCard>
      </Stack>

      <OfferLetterPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        detail={detail}
      />

      <EnterpriseConfirmationDialog
        open={confirmOpen}
        title="Generate Offer Letter?"
        message="This will calculate salary breakup from the approved CTC, populate the offer letter template, generate a PDF, and store it against this offer."
        confirmLabel="Generate Offer Letter"
        confirmColor="primary"
        loading={generating}
        onConfirm={handleGenerate}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}

export default OfferLetterWorkspacePanel;
