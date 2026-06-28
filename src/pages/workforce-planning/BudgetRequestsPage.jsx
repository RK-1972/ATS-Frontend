import { useOutletContext } from "react-router-dom";

import {
  Grid,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";

import { useState } from "react";

import { MdAdd } from "react-icons/md";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import ConfigSurface from "../../components/platform-config/ConfigSurface";
import BudgetRequestCard from "../../components/workforce-planning/BudgetRequestCard";
import WorkforceStatusChip from "../../components/workforce-planning/WorkforceStatusChip";
import { formatCurrency } from "@/utils/formatCurrency";

function BudgetRequestsPage() {

  const { data, setToastMessage } = useOutletContext();
  const [view, setView] = useState("cards");

  return (

    <>

      <ConfigPageHeader
        title="Budget requests"
        subtitle="Hiring managers submit manpower budget requests before recruitment can begin."
        breadcrumbs={[
          { label: "Workforce Planning" },
          { label: "Budget Requests" }
        ]}
        statusChip={
          <Button
            variant="contained"
            size="small"
            startIcon={<MdAdd size={18} />}
            onClick={() =>
              setToastMessage(
                "New budget request form will connect to Workflow Engine."
              )
            }
            sx={{ fontWeight: 600 }}
          >
            New request
          </Button>
        }
      />

      <Stack
        direction="row"
        justifyContent="flex-end"
        mb={1}
      >

        <ToggleButtonGroup
          size="small"
          value={view}
          exclusive
          onChange={(_, val) => val && setView(val)}
          sx={{ "& .MuiToggleButton-root": { py: 0.375, px: 1.25, fontSize: 12 } }}
        >

          <ToggleButton value="cards">Cards</ToggleButton>
          <ToggleButton value="table">Table</ToggleButton>

        </ToggleButtonGroup>

      </Stack>

      {view === "cards" ? (

        <Grid container spacing={1.5}>

          {data.budget_requests.map((request) => (

            <Grid key={request.id} size={{ xs: 12, md: 6, lg: 4 }}>

              <BudgetRequestCard request={request} />

            </Grid>

          ))}

        </Grid>

      ) : (

        <ConfigSurface sx={{ p: 0, overflow: "hidden" }}>

          <TableContainer>

            <Table size="small">

              <TableHead>

                <TableRow sx={{ bgcolor: "action.hover" }}>

                  <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Request</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Position</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }} align="center">HC</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }} align="right">Budget</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Status</TableCell>

                </TableRow>

              </TableHead>

              <TableBody>

                {data.budget_requests.map((req) => (

                  <TableRow key={req.id} hover>

                    <TableCell sx={{ py: 0.75, fontSize: 12 }}>{req.id}</TableCell>
                    <TableCell sx={{ py: 0.75, fontSize: 13 }}>{req.department}</TableCell>
                    <TableCell sx={{ py: 0.75, fontSize: 13 }}>{req.position}</TableCell>
                    <TableCell sx={{ py: 0.75, fontSize: 13 }}>{req.grade}</TableCell>
                    <TableCell align="center" sx={{ py: 0.75, fontSize: 13 }}>{req.headcount}</TableCell>
                    <TableCell align="right" sx={{ py: 0.75, fontSize: 13 }}>{formatCurrency(req.proposed_budget)}</TableCell>
                    <TableCell sx={{ py: 0.75 }}><WorkforceStatusChip status={req.status} /></TableCell>

                  </TableRow>

                ))}

              </TableBody>

            </Table>

          </TableContainer>

        </ConfigSurface>

      )}

      {data.budget_requests[0] && (

      <ConfigSurface sx={{ mt: 1.5 }}>

        <Typography variant="body2" fontWeight={700} sx={{ fontSize: 14, mb: 0.5 }}>
          Sample justification — {data.budget_requests[0].id}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.45 }}>
          {data.budget_requests[0].justification}
        </Typography>

      </ConfigSurface>

      )}

    </>

  );

}

export default BudgetRequestsPage;
