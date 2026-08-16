import {

  Box,

  Chip,

  Stack,

  Typography

} from "@mui/material";



import ConfigSurface from "../platform-config/ConfigSurface";

import { formatDateTime } from "@/utils/formatDateTime";



function ClarificationField({ label, value, multiline = false }) {

  return (

    <Box sx={{ mt: 0.75 }}>

      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, fontWeight: 600 }}>

        {label}

      </Typography>

      <Typography

        variant="body2"

        sx={{

          fontSize: 13,

          mt: 0.25,

          whiteSpace: multiline ? "pre-wrap" : "normal"

        }}

      >

        {value || "—"}

      </Typography>

    </Box>

  );

}



function ClarificationTimeline({ rounds = [], workflowTimeline = [], requestorName = null }) {

  const displayRounds = [...rounds].reverse();

  const hasRounds = displayRounds.length > 0;

  const hasLegacyTimeline =

    !hasRounds

    && workflowTimeline.some(

      (event) =>

        event.event_type === "ClarificationRequested"

        || event.event_type === "ClarificationSubmitted"

        || event.event_type === "ClarificationResumed"

    );



  if (!hasRounds && !hasLegacyTimeline) {

    return null;

  }



  const resolveInitiatorLabel = (round) =>

    round.responded_by || requestorName || "Request Initiator";



  return (

    <ConfigSurface>

      <Typography variant="body2" fontWeight={700} mb={1} sx={{ fontSize: 14 }}>

        Clarification history

      </Typography>



      {hasRounds ? (

        <Stack spacing={1.5}>

          {displayRounds.map((round) => (

            <Box

              key={`round-${round.round}`}

              sx={{

                p: 1.25,

                borderRadius: 2,

                bgcolor: "action.hover",

                border: 1,

                borderColor: round.pending ? "warning.main" : "divider"

              }}

            >

              <Stack

                direction="row"

                alignItems="center"

                justifyContent="space-between"

                mb={0.5}

              >

                <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>

                  Clarification round {round.round}

                </Typography>

                {round.pending ? (

                  <Chip

                    label="Awaiting initiator response"

                    size="small"

                    color="warning"

                    variant="outlined"

                    sx={{ height: 22, fontSize: 11, fontWeight: 600 }}

                  />

                ) : round.turnaround ? (

                  <Chip

                    label={`Response turnaround: ${round.turnaround}`}

                    size="small"

                    variant="outlined"

                    sx={{ height: 22, fontSize: 11, fontWeight: 600 }}

                  />

                ) : null}

              </Stack>



              <ClarificationField

                label="Requested by"

                value={

                  round.requested_by_role

                    ? `${round.requested_by || "Approver"} (${round.requested_by_role})`

                    : round.requested_by || "Approver"

                }

              />

              <ClarificationField

                label="Requested on"

                value={formatDateTime(round.requested_on, { includeYear: true })}

              />

              <ClarificationField

                label="Approver's clarification"

                value={round.request_comments || "—"}

                multiline

              />



              {round.pending ? (

                <Box mt={1} pt={1} borderTop={1} borderColor="divider">

                  <ClarificationField label="Status" value="Awaiting initiator response" />

                  <ClarificationField label="Initiator response" value="Not yet submitted" />

                </Box>

              ) : (

                <Box mt={1} pt={1} borderTop={1} borderColor="divider">

                  <ClarificationField

                    label="Response by"

                    value={resolveInitiatorLabel(round)}

                  />

                  <ClarificationField

                    label="Responded on"

                    value={formatDateTime(round.responded_on, { includeYear: true })}

                  />

                  <ClarificationField

                    label="Initiator response"

                    value={round.response_comments || "—"}

                    multiline

                  />

                  <ClarificationField

                    label="Response turnaround"

                    value={round.turnaround || "—"}

                  />

                </Box>

              )}

            </Box>

          ))}

        </Stack>

      ) : null}



      {hasLegacyTimeline ? (

        <Stack spacing={0}>

          {[...workflowTimeline]

            .filter(

              (event) =>

                event.event_type === "ClarificationRequested"

                || event.event_type === "ClarificationSubmitted"

                || event.event_type === "ClarificationResumed"

            )

            .reverse()

            .map((event, index, filtered) => (

              <Box

                key={`${event.event_type}-${event.recorded_on}-${index}`}

                sx={{

                  display: "flex",

                  gap: 1.25,

                  py: 1,

                  borderBottom: index < filtered.length - 1 ? 1 : 0,

                  borderColor: "divider"

                }}

              >

                <Box

                  sx={{

                    width: 8,

                    height: 8,

                    borderRadius: "50%",

                    bgcolor: "primary.main",

                    mt: 0.75,

                    flexShrink: 0

                  }}

                />

                <Box flex={1} minWidth={0}>

                  <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>

                    {event.event}

                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>

                    {formatDateTime(event.recorded_on, { includeYear: true })} · {event.actor || "—"}

                    {event.turnaround ? ` · Response turnaround: ${event.turnaround}` : ""}

                  </Typography>

                  {event.comment ? (

                    <Typography variant="caption" display="block" mt={0.5} sx={{ fontSize: 12 }}>

                      {event.comment}

                    </Typography>

                  ) : null}

                </Box>

              </Box>

            ))}

        </Stack>

      ) : null}

    </ConfigSurface>

  );

}



export default ClarificationTimeline;


