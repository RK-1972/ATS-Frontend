import { Stack, Button, Typography } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import { EnterpriseSurface } from "@/components/enterprise";

function CandidateEditableCard({
  title,
  subtitle,
  isEditing = false,
  isSaving = false,
  onEdit,
  onSave,
  onCancel,
  children,
  editContent
}) {
  return (
    <EnterpriseSurface
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider"
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
        mb={isEditing || children ? 1.5 : 0}
      >
        <Stack spacing={0.25}>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={0.75}>
          {!isEditing ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
              onClick={onEdit}
            >
              Edit
            </Button>
          ) : (
            <>
              <Button
                size="small"
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                onClick={onSave}
                disabled={isSaving}
              >
                Save
              </Button>
              <Button
                size="small"
                variant="text"
                startIcon={<CloseOutlinedIcon />}
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      {isEditing ? editContent : children}
    </EnterpriseSurface>
  );
}

export default CandidateEditableCard;
