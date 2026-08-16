import { useState } from "react";

import {
  Box,
  Typography,
  Tab,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  CircularProgress
} from "@mui/material";

import EnterpriseTabs from "@/components/enterprise/EnterpriseTabs";
import {
  formatOptalynxDateTime,
  formatOptalynxDateTimeValue,
  formatOptalynxMaybeDateTime
} from "@/utils/formatDateTime";
import { mapDisplayStatus } from "./lifecycleTimelinePresentation";
import BusinessRuleDetailDialog from "./BusinessRuleDetailDialog";
import StageApprovalPanel from "./StageApprovalPanel";

function InspectorShell({ children, header = null }) {

  return (

    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >

      {header ? (
        <Box
          sx={{
            flexShrink: 0,
            bgcolor: "background.paper",
            zIndex: 1
          }}
        >
          {header}
        </Box>
      ) : null}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          px: 1.5,
          py: 1,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "divider",
            borderRadius: 1
          }
        }}
      >
        {children}
      </Box>

    </Box>

  );

}

function LiveInspectorSection({ title, children }) {

  if (!children) {
    return null;
  }

  return (
    <Box mb={1.5}>
      <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5}>
        {title}
      </Typography>
      {children}
    </Box>
  );

}

const INSPECTOR_DATE_FIELD_KEYS = new Set([
  "assigned_on",
  "applied_on",
  "modified_on",
  "accepted_on",
  "declined_on",
  "recorded_on",
  "action_on",
  "due_at",
  "created_on",
  "submitted_on"
]);

function formatInspectorRows(items = []) {
  return items.map((item) => {
    const formattedValue = formatOptalynxMaybeDateTime(item.value);

    return {
      label: item.label,
      value: item.availability && item.availability !== "real"
        ? `${formattedValue} (${item.availability})`
        : formattedValue
    };
  });
}

function formatRelatedRecordObject(record) {
  if (!record || typeof record !== "object") {
    return String(record ?? "—");
  }

  return Object.entries(record)
    .filter(([key]) => key !== "availability")
    .map(([key, val]) => {
      const display = INSPECTOR_DATE_FIELD_KEYS.has(key)
        ? formatOptalynxDateTimeValue(val)
        : String(val ?? "—");

      return `${key.replace(/_/g, " ")}: ${display}`;
    })
    .join(" · ");
}

function LiveStageInspectorContent({ data }) {

  const { sections = {}, metadata = {} } = data;
  const hasContent = Boolean(
    sections.key_metrics?.length
    || sections.details?.length
    || sections.workflow
    || (sections.related_records && Object.keys(sections.related_records).length)
    || sections.history?.length
  );

  if (!hasContent) {
    return (
      <Typography variant="body2" color="text.secondary">
        No additional details are available for this stage.
      </Typography>
    );
  }

  return (

    <>

      <LiveInspectorSection title="Key metrics">
        {sections.key_metrics?.length ? (
          <PropertyGrid rows={formatInspectorRows(sections.key_metrics.map((item) => ({
            label: item.label,
            value: item.value,
            availability: item.availability
          })))} />
        ) : null}
      </LiveInspectorSection>

      <LiveInspectorSection title="Details">
        {sections.details?.length ? (
          <PropertyGrid rows={formatInspectorRows(sections.details)} />
        ) : null}
      </LiveInspectorSection>

      <LiveInspectorSection title="Workflow">
        {sections.workflow ? (
          <Stack spacing={0.75}>
            <PropertyGrid
              rows={[
                { label: "Workflow code", value: sections.workflow.workflow_code || "—" },
                { label: "Status", value: sections.workflow.status || "—" },
                {
                  label: "Pending task",
                  value: sections.workflow.pending_task?.title || "—"
                }
              ]}
            />
            {sections.workflow.approval_steps?.length ? (
              <Typography variant="caption" color="text.secondary">
                {sections.workflow.approval_steps.length} approval step(s)
              </Typography>
            ) : null}
          </Stack>
        ) : null}
      </LiveInspectorSection>

      <LiveInspectorSection title="Related records">
        {sections.related_records ? (
          <Stack spacing={0.75}>
            {Object.entries(sections.related_records)
              .filter(([key, value]) => !key.endsWith("_truncated") && value != null)
              .map(([key, value]) => (
                <Box key={key}>
                  <Typography variant="caption" fontWeight={700} display="block" mb={0.25}>
                    {key.replace(/_/g, " ")}
                  </Typography>
                  {Array.isArray(value) ? (
                    <Typography variant="caption" color="text.secondary">
                      {value.length} record(s)
                      {sections.related_records[`${key}_truncated`] ? " · truncated" : ""}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {formatRelatedRecordObject(value)}
                    </Typography>
                  )}
                </Box>
              ))}
          </Stack>
        ) : null}
      </LiveInspectorSection>

      <LiveInspectorSection title="History">
        {sections.history?.length ? (
          <Stack spacing={0.75}>
            {sections.history.slice(0, 8).map((event, index) => (
              <Box key={`${event.recorded_on || event.action}-${index}`}>
                <Typography variant="caption" fontWeight={700}>
                  {formatOptalynxDateTime(event.recorded_on)}
                  {event.actor ? ` · ${event.actor}` : ""}
                </Typography>
                <Typography variant="caption" display="block">
                  {event.action || event.event_type || "Event"}
                </Typography>
              </Box>
            ))}
            {sections.history_truncated ? (
              <Typography variant="caption" color="text.secondary">
                Additional history truncated.
              </Typography>
            ) : null}
          </Stack>
        ) : null}
      </LiveInspectorSection>

      {metadata.unsupported_fields?.length ? (
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          Unsupported in V1: {metadata.unsupported_fields.slice(0, 4).join(", ")}
          {metadata.unsupported_fields.length > 4 ? "…" : ""}
        </Typography>
      ) : null}

    </>

  );

}

function LiveStageInspectorPanel({

  lifecycleSelectedKey,
  stageInspectorData,
  stageInspectorLoading,
  stageInspectorError

}) {

  if (!lifecycleSelectedKey) {
    return (
      <InspectorShell>
        <Typography variant="body2" color="text.secondary">
          Select a workflow stage to inspect details.
        </Typography>
      </InspectorShell>
    );
  }

  if (stageInspectorLoading) {
    return (
      <InspectorShell>
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Loading stage details…
          </Typography>
        </Stack>
      </InspectorShell>
    );
  }

  if (stageInspectorError) {
    return (
      <InspectorShell>
        <Typography variant="body2" color="error.main">
          Stage details could not be loaded.
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
          {stageInspectorError}
        </Typography>
      </InspectorShell>
    );
  }

  if (!stageInspectorData?.milestone) {
    return (
      <InspectorShell>
        <Typography variant="body2" color="text.secondary">
          No additional details are available for this stage.
        </Typography>
      </InspectorShell>
    );
  }

  const display = mapDisplayStatus(stageInspectorData.milestone.status);

  return (

    <InspectorShell
      header={(
        <Box sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="caption" fontWeight={700} color="primary.main">
            Inspector
          </Typography>
          <Typography variant="body2" fontWeight={700} lineHeight={1.2}>
            {stageInspectorData.milestone.label}
          </Typography>
          <Chip
            label={display.label}
            size="small"
            color={display.color}
            variant="outlined"
            sx={{
              mt: 0.5,
              height: 22,
              fontSize: 10,
              fontWeight: 700
            }}
          />
        </Box>
      )}
    >
      <LiveStageInspectorContent data={stageInspectorData} />
    </InspectorShell>

  );

}

function PropertyGrid({ rows }) {

  return (

    <Table size="small">

      <TableBody>

        {rows.map((row) => (

          <TableRow
            key={row.label}
            sx={{ "&:last-child td": { border: 0 } }}
          >

            <TableCell
              sx={{
                py: 0.5,
                pl: 0,
                width: "38%",
                border: 0,
                color: "text.secondary",
                fontSize: 12,
                fontWeight: 600
              }}
            >
              {row.label}
            </TableCell>

            <TableCell sx={{ py: 0.5, border: 0, fontSize: 12 }}>
              {row.value}
            </TableCell>

          </TableRow>

        ))}

      </TableBody>

    </Table>

  );

}

function StageInspectorPanel({

  liveModeEnabled = false,
  lifecycleSelectedKey,
  stageInspectorData,
  stageInspectorLoading,
  stageInspectorError,
  stage,
  stageNotifications,
  stageTimeline,
  businessRuleDetails,
  processBusinessRules,
  budget,
  showClarificationForm,
  clarificationDraft,
  onApprove,
  onReject,
  onRequestClarification,
  onSendClarification,
  onSubmitClarification,
  onUpdateClarification,
  onCancelClarification

}) {

  const [tab, setTab] = useState(0);
  const [selectedRule, setSelectedRule] = useState(null);

  if (liveModeEnabled) {
    return (
      <LiveStageInspectorPanel
        lifecycleSelectedKey={lifecycleSelectedKey}
        stageInspectorData={stageInspectorData}
        stageInspectorLoading={stageInspectorLoading}
        stageInspectorError={stageInspectorError}
      />
    );
  }

  if (!stage) {

    return (

      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >

        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Select a workflow stage to inspect details.
        </Typography>

      </Box>

    );

  }

  const display = mapDisplayStatus(stage.status);

  const stageRules = [
    ...new Set([
      ...processBusinessRules,
      ...stage.business_rules
    ])
  ];

  const handleRuleClick = (ruleName) => {
    setSelectedRule(ruleName);
  };

  return (

    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >

      <Box sx={{ flexShrink: 0, px: 1.5, py: 1, borderBottom: 1, borderColor: "divider" }}>

        <Typography variant="caption" fontWeight={700} color="primary.main">
          Inspector
        </Typography>

        <Typography variant="body2" fontWeight={700} lineHeight={1.2}>
          {stage.name}
        </Typography>

        <Chip
          label={display.label}
          size="small"
          color={display.color}
          variant="outlined"
          sx={{
            mt: 0.5,
            height: 22,
            fontSize: 10,
            fontWeight: 700
          }}
        />

      </Box>

      <EnterpriseTabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          flexShrink: 0,
          minHeight: 40,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            minHeight: 40,
            minWidth: "auto",
            py: 0.75,
            px: 1.5,
            fontSize: 12,
            fontWeight: 600,
            textTransform: "none",
            whiteSpace: "nowrap"
          }
        }}
      >

        <Tab label="General" />
        <Tab label="Approvals" />
        <Tab label="Business Rules" />
        <Tab label="Notifications" />
        <Tab label="Budget" />
        <Tab label="Audit" />
        <Tab label="AI Insights" />
        <Tab label="History" />

      </EnterpriseTabs>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          px: 1.5,
          py: 1,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "divider",
            borderRadius: 1
          }
        }}
      >

        {tab === 0 && (
          <PropertyGrid
            rows={[
              { label: "Owner", value: stage.owner },
              { label: "Responsible Role", value: stage.responsible_role },
              { label: "Workflow", value: stage.workflow },
              {
                label: "SLA",
                value: `${stage.sla_hours}h total · ${stage.sla_remaining_hours}h remaining`
              },
              { label: "Completion", value: `${stage.completion_pct}%` },
              {
                label: "Approval Stage",
                value: stage.is_approval_stage ? "Yes" : "No"
              }
            ]}
          />
        )}

        {tab === 1 && (
          <StageApprovalPanel
            embedded
            stage={stage}
            showClarificationForm={showClarificationForm}
            clarificationDraft={clarificationDraft}
            onApprove={onApprove}
            onReject={onReject}
            onRequestClarification={onRequestClarification}
            onSendClarification={onSendClarification}
            onSubmitClarification={onSubmitClarification}
            onUpdateClarification={onUpdateClarification}
            onCancelClarification={onCancelClarification}
          />
        )}

        {tab === 2 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {stageRules.map((rule) => (
              <Chip
                key={rule}
                label={`✓ ${rule}`}
                size="small"
                clickable
                color={
                  businessRuleDetails[rule] ? "primary" : "default"
                }
                variant="outlined"
                onClick={() => handleRuleClick(rule)}
                sx={{ height: 24, fontSize: 11, fontWeight: 600 }}
              />
            ))}
          </Stack>
        )}

        {tab === 3 && (
          stageNotifications ? (
            <Stack spacing={0.5}>
              <Typography variant="caption" fontWeight={700}>
                {stageNotifications.title}
              </Typography>
              {stage.notifications.map((note) => (
                <Typography key={note} variant="caption">
                  • {note}
                </Typography>
              ))}
              {stageNotifications.deliveries?.length > 0 && (
                <Typography variant="caption" color="text.secondary" mt={0.5}>
                  {stageNotifications.deliveries.length} delivery records — see
                  Notification Preview below.
                </Typography>
              )}
            </Stack>
          ) : (
            <Typography variant="caption" color="text.secondary">
              No notifications configured for this stage.
            </Typography>
          )
        )}

        {tab === 4 && (
          stage.budget_validation || stage.key.includes("budget") ? (
            <PropertyGrid
              rows={[
                {
                  label: "Approved Budget",
                  value: stage.budget_validation
                    ? `${stage.budget_validation.approved_budget_lpa} LPA`
                    : `${budget.approved_budget_lpa} LPA`
                },
                {
                  label: "Offered CTC",
                  value: stage.budget_validation?.offered_ctc_lpa
                    ? `${stage.budget_validation.offered_ctc_lpa} LPA`
                    : `${budget.offered_ctc_lpa} LPA`
                },
                {
                  label: "Variance",
                  value: `+${budget.variance_pct}%`
                },
                {
                  label: "Status",
                  value: stage.budget_validation?.status ?? budget.status
                }
              ]}
            />
          ) : (
            <Typography variant="caption" color="text.secondary">
              Budget validation not applicable at this stage.
            </Typography>
          )
        )}

        {tab === 5 && (
          <Typography variant="caption" color="text.secondary">
            {stage.audit_summary}
          </Typography>
        )}

        {tab === 6 && (
          stage.ai_recommendations.length > 0 ? (
            <Stack spacing={0.5}>
              {stage.ai_recommendations.map((rec) => (
                <Typography key={rec} variant="caption" color="primary.main">
                  • {rec}
                </Typography>
              ))}
            </Stack>
          ) : (
            <Typography variant="caption" color="text.secondary">
              No AI recommendations for this stage.
            </Typography>
          )
        )}

        {tab === 7 && (
          stageTimeline.length > 0 ? (
            <Stack spacing={0.75}>
              {stageTimeline.map((event) => (
                <Box key={event.id}>
                  <Typography variant="caption" fontWeight={700}>
                    {formatOptalynxDateTime(event.time)}
                    {" · "}{event.actor}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {event.action}
                  </Typography>
                  {event.comment && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      {event.comment}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="caption" color="text.secondary">
              No history events for this stage.
            </Typography>
          )
        )}

      </Box>

      <BusinessRuleDetailDialog
        ruleName={selectedRule}
        details={selectedRule ? businessRuleDetails[selectedRule] : null}
        open={Boolean(selectedRule)}
        onClose={() => setSelectedRule(null)}
      />

    </Box>

  );

}

export default StageInspectorPanel;
