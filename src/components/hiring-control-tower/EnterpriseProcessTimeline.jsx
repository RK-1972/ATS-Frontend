import { useRef, useEffect } from "react";

import {
  Box,
  Typography,
  Chip,
  Tooltip
} from "@mui/material";

import {
  MdAccountBalance,
  MdAccountTree,
  MdAutoAwesome,
  MdBusinessCenter,
  MdCheckCircle,
  MdDescription,
  MdFilterAlt,
  MdGavel,
  MdGroups,
  MdHowToReg,
  MdInventory,
  MdLocalOffer,
  MdMonetizationOn,
  MdNotifications,
  MdPayments,
  MdPerson,
  MdPersonAdd,
  MdPolicy,
  MdRateReview,
  MdRecordVoiceOver,
  MdSend,
  MdTune,
  MdWorkOutline
} from "react-icons/md";

const STAGE_ICONS = {
  position_budget_approval: MdAccountBalance,
  approved_position: MdInventory,
  requisition_raised: MdDescription,
  ta_leader_review: MdRateReview,
  approved_requisition: MdCheckCircle,
  recruiter_assigned: MdPersonAdd,
  recruiter_notified: MdNotifications,
  applied: MdPerson,
  screening: MdFilterAlt,
  l1: MdRecordVoiceOver,
  l2: MdGroups,
  client: MdBusinessCenter,
  offer: MdLocalOffer,
  budget_validation: MdMonetizationOn,
  finance_approval: MdGavel,
  leadership_approval: MdGavel,
  release_offer: MdSend,
  joined: MdHowToReg
};

const SHORT_LABELS = {
  position_budget_approval: "Position Approved",
  approved_position: "Approved Catalogue",
  requisition_raised: "Requisition Raised",
  ta_leader_review: "TA Review",
  approved_requisition: "Req Approved",
  recruiter_assigned: "Recruiter Assigned",
  recruiter_notified: "Recruiter Notified",
  applied: "Applied",
  screening: "Screening",
  l1: "L1",
  l2: "L2",
  client: "Client",
  offer: "Offer",
  budget_validation: "Budget Check",
  finance_approval: "Finance Approval",
  leadership_approval: "Leadership",
  release_offer: "Released",
  joined: "Joined"
};

const STATUS_DISPLAY = {
  Completed: { label: "Completed", color: "success" },
  "In Progress": { label: "Running", color: "primary" },
  Pending: { label: "Waiting", color: "default" },
  "Waiting for Clarification": { label: "Clarification", color: "warning" },
  "Clarification Submitted": { label: "Clarification", color: "info" },
  Rejected: { label: "Rejected", color: "error" }
};

function mapDisplayStatus(status) {

  return STATUS_DISPLAY[status] ?? { label: "On Hold", color: "default" };

}

function WorkflowCard({ stage, selected, onSelect, cardRef }) {

  const Icon = STAGE_ICONS[stage.key] ?? MdCheckCircle;
  const display = mapDisplayStatus(stage.status);
  const label = SHORT_LABELS[stage.key] ?? stage.name;

  const slaLabel =
    stage.sla_hours > 0
      ? `${stage.sla_remaining_hours}h remaining`
      : "—";

  return (

    <Tooltip title={stage.name} placement="top">

      <Box
        ref={cardRef}
        onClick={() => onSelect(stage.key)}
        sx={{
          width: 108,
          flexShrink: 0,
          border: 2,
          borderColor: selected ? "primary.main" : "divider",
          borderRadius: 2,
          bgcolor: selected ? "rgba(31, 59, 99, 0.04)" : "background.paper",
          px: 1.25,
          py: 1.25,
          cursor: "pointer",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          boxShadow: selected ? 1 : 0,
          "&:hover": {
            borderColor: "primary.light",
            boxShadow: 1
          }
        }}
      >

        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: selected ? "primary.main" : "rgba(31, 59, 99, 0.08)",
            color: selected ? "primary.contrastText" : "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 0.75
          }}
        >
          <Icon size={18} />
        </Box>

        <Typography
          variant="caption"
          fontWeight={700}
          lineHeight={1.25}
          sx={{
            fontSize: 11,
            mb: 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            display: "-webkit-box"
          }}
        >
          {label}
        </Typography>

        <Chip
          label={display.label}
          size="small"
          color={display.color}
          variant={stage.status === "Completed" ? "filled" : "outlined"}
          sx={{
            height: 20,
            fontSize: 10,
            fontWeight: 700,
            mb: 0.5,
            maxWidth: "100%",
            "& .MuiChip-label": { px: 0.75 }
          }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{
            fontSize: 10,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            mb: 0.25
          }}
        >
          {stage.owner}
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
          SLA · {slaLabel}
        </Typography>

      </Box>

    </Tooltip>

  );

}

function CardConnector({ active }) {

  return (

    <Box
      sx={{
        flexShrink: 0,
        width: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center"
      }}
    >

      <Box
        sx={{
          height: 2,
          width: "100%",
          bgcolor: active ? "success.main" : "divider",
          borderRadius: 1
        }}
      />

    </Box>

  );

}

function EnterpriseProcessTimeline({

  stages,
  selectedKey,
  onSelect

}) {

  const scrollRef = useRef(null);
  const cardRefs = useRef({});

  useEffect(() => {

    const el = cardRefs.current[selectedKey];

    if (el?.scrollIntoView) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
      });
    }

  }, [selectedKey]);

  const completedCount = stages.filter(
    (s) => s.status === "Completed"
  ).length;

  return (

    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        overflow: "hidden"
      }}
    >

      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >

        <Typography variant="subtitle2" fontWeight={700}>
          Hiring Lifecycle
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {completedCount} of {stages.length} stages complete
        </Typography>

      </Box>

      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          alignItems: "stretch",
          overflowX: "auto",
          py: 2,
          px: 2,
          gap: 0,
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "divider",
            borderRadius: 1
          }
        }}
      >

        {stages.map((stage, index) => {

          const selected = stage.key === selectedKey;
          const connectorActive = stage.status === "Completed";

          return (

            <Box
              key={stage.key}
              sx={{ display: "flex", alignItems: "stretch" }}
            >

              <WorkflowCard
                stage={stage}
                selected={selected}
                onSelect={onSelect}
                cardRef={(node) => {
                  cardRefs.current[stage.key] = node;
                }}
              />

              {index < stages.length - 1 && (
                <CardConnector active={connectorActive} />
              )}

            </Box>

          );

        })}

      </Box>

    </Box>

  );

}

export default EnterpriseProcessTimeline;

export { mapDisplayStatus };
