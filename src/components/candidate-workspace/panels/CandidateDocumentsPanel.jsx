import {
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  Typography
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

import { EnterpriseSurface } from "@/components/enterprise";
import { getPublishedRecords } from "@/enterprise/masterDataHelpers";

const DOCUMENT_GROUPS = [
  {
    key: "resume",
    title: "Resume",
    codes: ["RESUME"]
  },
  {
    key: "identity",
    title: "Identity Documents",
    codes: ["PASSPORT", "PAN", "AADHAAR"]
  },
  {
    key: "employment",
    title: "Employment Documents",
    codes: ["OFFER_LETTER", "EXPERIENCE_LETTER"]
  },
  {
    key: "education",
    title: "Education Documents",
    codes: ["DEGREE", "MARKSHEET", "EDUCATION_CERTIFICATE"]
  },
  {
    key: "other",
    title: "Other Documents",
    codes: ["OTHER", "VISA", "WORK_PERMIT"]
  }
];

function resolveDocument(documentCode, candidate, documents, typeByCode) {
  const label = typeByCode.get(documentCode) || documentCode.replace(/_/g, " ");
  const uploaded = documents.find(
    (doc) => String(doc.document_type_code || doc.type).toUpperCase() === documentCode
  );

  let filePath = uploaded?.file_path || uploaded?.document_path;

  if (documentCode === "RESUME" && candidate.resume_path) {
    filePath = candidate.resume_path;
  }

  if (documentCode === "PAN" && candidate.pan_number && !filePath) {
    return {
      code: documentCode,
      label,
      status: "On file",
      meta: candidate.pan_number,
      filePath: null
    };
  }

  return {
    code: documentCode,
    label,
    status: filePath ? "Uploaded" : "Missing",
    meta: uploaded?.uploaded_on || null,
    filePath
  };
}

function DocumentCard({ document, onAction }) {
  const isUploaded = document.status === "Uploaded" || document.status === "On file";

  return (
    <EnterpriseSurface
      elevation={0}
      sx={{
        height: "100%",
        border: 1,
        borderColor: "divider",
        transition: "box-shadow 0.2s ease",
        "&:hover": { boxShadow: 2 }
      }}
    >
      <Stack spacing={1.5} height="100%">
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: isUploaded ? "primary.main" : "action.selected",
              color: isUploaded ? "primary.contrastText" : "text.secondary",
              display: "grid",
              placeItems: "center"
            }}
          >
            <DescriptionOutlinedIcon fontSize="small" />
          </Box>
          <Box minWidth={0}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {document.label}
            </Typography>
            <Chip
              size="small"
              label={document.status}
              color={isUploaded ? "success" : "default"}
              variant={isUploaded ? "filled" : "outlined"}
              sx={{ height: 22, mt: 0.25 }}
            />
          </Box>
        </Stack>

        {document.meta && (
          <Typography variant="caption" color="text.secondary">
            {typeof document.meta === "string" && document.meta.includes("-")
              ? new Date(document.meta).toLocaleString()
              : document.meta}
          </Typography>
        )}

        <Stack direction="row" spacing={0.75} mt="auto" flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="text"
            startIcon={<VisibilityOutlinedIcon />}
            disabled={!document.filePath}
            onClick={() => onAction?.("preview", document)}
          >
            Preview
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<DownloadOutlinedIcon />}
            disabled={!document.filePath}
            onClick={() => onAction?.("download", document)}
          >
            Download
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<UploadFileOutlinedIcon />}
            onClick={() => onAction?.("replace", document)}
          >
            Replace
          </Button>
        </Stack>
      </Stack>
    </EnterpriseSurface>
  );
}

function CandidateDocumentsPanel({ candidate = {}, documents = [], masterData, onAction }) {
  const docTypes = getPublishedRecords(masterData, "document_types");
  const typeByCode = new Map(docTypes.map((row) => [row.code, row.name]));

  return (
    <Stack spacing={3}>
      {DOCUMENT_GROUPS.map((group) => {
        const cards = group.codes.map((code) =>
          resolveDocument(code, candidate, documents, typeByCode)
        );

        return (
          <Box key={group.key}>
            <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
              {group.title}
            </Typography>
            <Grid container spacing={1.5}>
              {cards.map((document) => (
                <Grid item xs={12} sm={6} lg={4} key={document.code}>
                  <DocumentCard document={document} onAction={onAction} />
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}
    </Stack>
  );
}

export default CandidateDocumentsPanel;
