import { useState } from "react";

import {
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow
} from "@mui/material";

import { mapDisplayStatus } from "./EnterpriseProcessTimeline";
import BusinessRuleDetailDialog from "./BusinessRuleDetailDialog";
import StageApprovalPanel from "./StageApprovalPanel";

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

  if (!stage) {

    return (

      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
          width: "100%",
          minWidth: 340,
          maxWidth: 360,
          height: "100%",
          minHeight: 380,
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
        minWidth: 340,
        maxWidth: 360,
        height: "100%",
        minHeight: 380,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >

      <Box sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: "divider" }}>

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

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
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

      </Tabs>

      <Box sx={{ flex: 1, overflow: "auto", px: 1.5, py: 1 }}>

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
                    {new Date(event.time).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
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
