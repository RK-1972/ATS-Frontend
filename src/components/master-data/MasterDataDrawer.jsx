import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Stack,
  TextField,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  MenuItem
} from "@mui/material";

import { MdClose } from "react-icons/md";

import DependencyPanel from "./DependencyPanel";
import { DEFAULT_USED_BY } from "@/enterprise/masterDataConstants";

const DRAWER_TABS = [
  { key: "edit", label: "Edit" },
  { key: "version", label: "Version" },
  { key: "dependencies", label: "Dependencies" },
  { key: "history", label: "History" },
  { key: "audit", label: "Audit" }
];

function formatTimestamp(isoString) {

  if (!isoString) {
    return "—";
  }

  return new Date(isoString).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

}

function MasterDataDrawer({

  open,
  tab,
  draftRecord,
  auditEvents,
  onClose,
  onTabChange,
  onUpdateDraft,
  onSave,
  onPublish,
  onArchive,
  onRollback

}) {

  const usedBy = draftRecord?.usedBy?.length
    ? draftRecord.usedBy
    : DEFAULT_USED_BY[draftRecord?.entityType] || [];

  const tabIndex = Math.max(
    0,
    DRAWER_TABS.findIndex((item) => item.key === tab)
  );

  return (

    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 420 } }
      }}
    >

      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>

        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between"
          }}
        >

          <Box>

            <Typography variant="subtitle1" fontWeight={700}>
              {draftRecord?.id ? draftRecord.name : "New Master Record"}
            </Typography>

            {draftRecord?.code && (
              <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                {draftRecord.code}
              </Typography>
            )}

          </Box>

          <IconButton size="small" onClick={onClose} aria-label="Close drawer">
            <MdClose size={18} />
          </IconButton>

        </Box>

        <Tabs
          value={tabIndex}
          onChange={(_, index) => onTabChange(DRAWER_TABS[index].key)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            borderBottom: 1,
            borderColor: "divider",
            px: 1
          }}
        >
          {DRAWER_TABS.map((item) => (
            <Tab
              key={item.key}
              label={item.label}
              sx={{ minHeight: 40, py: 0.5, fontSize: 12, fontWeight: 600 }}
            />
          ))}
        </Tabs>

        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>

          {tab === "edit" && draftRecord && (

            <Stack spacing={1.5}>

              <TextField
                label="Code"
                size="small"
                value={draftRecord.code}
                onChange={(event) => onUpdateDraft("code", event.target.value)}
                fullWidth
                disabled={Boolean(draftRecord.id)}
                helperText={draftRecord.id ? "Code is immutable after creation" : ""}
              />

              <TextField
                label="Name"
                size="small"
                value={draftRecord.name}
                onChange={(event) => onUpdateDraft("name", event.target.value)}
                fullWidth
              />

              <TextField
                label="Description"
                size="small"
                value={draftRecord.description || ""}
                onChange={(event) => onUpdateDraft("description", event.target.value)}
                multiline
                minRows={3}
                fullWidth
              />

              <TextField
                select
                label="Status"
                size="small"
                value={draftRecord.status}
                onChange={(event) => onUpdateDraft("status", event.target.value)}
                fullWidth
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>

              <TextField
                label="Save reason (audit)"
                size="small"
                placeholder="Reason for this change"
                id="master-save-reason"
                fullWidth
              />

              <Stack direction="row" spacing={1}>

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    const reasonInput = document.getElementById("master-save-reason");
                    onSave(reasonInput?.value || "");
                  }}
                  sx={{ fontWeight: 600 }}
                >
                  Save
                </Button>

                {draftRecord.id && (
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onPublish(draftRecord.id)}
                      sx={{ fontWeight: 600 }}
                    >
                      Publish
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      onClick={() => onArchive(draftRecord.id)}
                      sx={{ fontWeight: 600 }}
                    >
                      Archive
                    </Button>
                  </>
                )}

              </Stack>

            </Stack>

          )}

          {tab === "version" && draftRecord && (

            <Stack spacing={1.5}>

              <Stack direction="row" spacing={1} alignItems="center">

                <Chip
                  label={`Version ${draftRecord.version}`}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />

                <Chip
                  label={draftRecord.versionStatus}
                  size="small"
                  color={
                    draftRecord.versionStatus === "Published"
                      ? "success"
                      : draftRecord.versionStatus === "Draft"
                        ? "warning"
                        : "default"
                  }
                  sx={{ fontWeight: 600 }}
                />

              </Stack>

              <Typography variant="body2" color="text.secondary">
                Master records follow draft → published → archived lifecycle.
                Publishing makes records available to all enterprise modules.
              </Typography>

              <Divider />

              <Typography variant="subtitle2" fontWeight={700}>
                Rollback
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={1}>
                Restore a previous published version.
              </Typography>

              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>

                {(draftRecord.history || [])
                  .filter((entry) => entry.status === "Published")
                  .map((entry) => (

                    <Button
                      key={`${entry.version}-${entry.date}`}
                      size="small"
                      variant="outlined"
                      onClick={() => onRollback(draftRecord.id, entry.version)}
                      sx={{ fontWeight: 600 }}
                    >
                      v{entry.version}
                    </Button>

                  ))}

              </Stack>

            </Stack>

          )}

          {tab === "dependencies" && (
            <DependencyPanel
              usedBy={usedBy}
              recordName={draftRecord?.name}
            />
          )}

          {tab === "history" && draftRecord && (

            <List dense disablePadding>

              {(draftRecord.history || []).slice().reverse().map((entry) => (

                <ListItem
                  key={`${entry.version}-${entry.date}`}
                  divider
                  sx={{ px: 0 }}
                >

                  <ListItemText
                    primary={`v${entry.version} — ${entry.status}`}
                    secondary={
                      <>
                        {formatTimestamp(entry.date)} · {entry.user}
                        {entry.reason ? ` · ${entry.reason}` : ""}
                      </>
                    }
                    primaryTypographyProps={{ fontWeight: 600, fontSize: 13 }}
                    secondaryTypographyProps={{ fontSize: 11 }}
                  />

                </ListItem>

              ))}

            </List>

          )}

          {tab === "audit" && (

            auditEvents.length ? (

              <List dense disablePadding>

                {auditEvents.map((event) => (

                  <ListItem key={event.id} divider sx={{ px: 0, flexDirection: "column", alignItems: "flex-start" }}>

                    <Typography variant="body2" fontWeight={600}>
                      {event.action}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(event.timestamp)} · {event.user}
                    </Typography>

                    {(event.previousValue || event.newValue) && (
                      <Typography variant="caption" sx={{ mt: 0.5 }}>
                        {event.previousValue && `From: ${event.previousValue}`}
                        {event.previousValue && event.newValue && " → "}
                        {event.newValue && `To: ${event.newValue}`}
                      </Typography>
                    )}

                    {event.metadata?.reason && (
                      <Typography variant="caption" color="text.secondary">
                        Reason: {event.metadata.reason}
                      </Typography>
                    )}

                  </ListItem>

                ))}

              </List>

            ) : (
              <Typography variant="body2" color="text.secondary">
                No enterprise audit events for this record yet.
              </Typography>
            )

          )}

        </Box>

      </Box>

    </Drawer>

  );

}

export default MasterDataDrawer;
