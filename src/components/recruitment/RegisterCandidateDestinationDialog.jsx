import {
  Box,
  Button,
  Card,
  CardActionArea,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PublicIcon from "@mui/icons-material/Public";

import EnterpriseModuleIcon from "@/components/enterprise/EnterpriseModuleIcon";

function RegisterCandidateDestinationDialog({
  open = false,
  onClose,
  selectedContainer = "PIPELINE",
  onSelectContainer,
  onConfirm,
  isSubmitting = false
}) {
  let ownerLabel = "Logged-in recruiter";

  try {
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
    const name = [loggedInUser?.first_name, loggedInUser?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    ownerLabel =
      name ||
      loggedInUser?.full_name ||
      loggedInUser?.employee_code ||
      "Logged-in recruiter";
  } catch {
    ownerLabel = "Logged-in recruiter";
  }

  const options = [
    {
      value: "PIPELINE",
      title: "My Pipeline",
      Icon: PersonIcon,
      module: "recruitment",
      description:
        "Candidate becomes part of your active recruitment pipeline.",
      owner: ownerLabel
    },
    {
      value: "TALENT_POOL",
      title: "Enterprise Talent Pool",
      Icon: PublicIcon,
      module: "candidates",
      description: "Candidate is available to all recruiters.",
      owner: "None"
    }
  ];

  const hasSelection = Boolean(selectedContainer);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "20px" }
      }}
    >
      <DialogTitle sx={{ pb: 0.5 }}>
        <Typography variant="h6" fontWeight={700}>
          Register Candidate
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Choose where this candidate should be registered.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1.25} sx={{ pt: 1 }}>
          {options.map((option) => {
            const selected = selectedContainer === option.value;

            return (
              <Card
                key={option.value}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: 2,
                  borderColor: selected ? "primary.main" : "divider",
                  bgcolor: selected ? "action.selected" : "background.paper"
                }}
              >
                <CardActionArea
                  onClick={() => onSelectContainer?.(option.value)}
                  sx={{ p: 1.5 }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <EnterpriseModuleIcon
                      icon={option.Icon}
                      module={option.module}
                      density="sm"
                      size={40}
                      iconSize={20}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {option.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Owner: {option.owner}
                      </Typography>
                    </Box>
                  </Stack>
                </CardActionArea>
              </Card>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!hasSelection || isSubmitting}
          onClick={onConfirm}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Register Candidate
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RegisterCandidateDestinationDialog;
