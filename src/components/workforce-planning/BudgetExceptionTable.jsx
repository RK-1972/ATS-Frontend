import {

  Table,

  TableBody,

  TableCell,

  TableContainer,

  TableHead,

  TableRow,

  Typography

} from "@mui/material";



import ConfigSurface from "../platform-config/ConfigSurface";

import { formatCurrency } from "@/utils/formatCurrency";

import WorkforceStatusChip from "./WorkforceStatusChip";



function BudgetExceptionTable({ exceptions }) {



  return (



    <ConfigSurface sx={{ p: 0, overflow: "hidden" }}>



      <TableContainer>



        <Table size="small">



          <TableHead>



            <TableRow sx={{ bgcolor: "action.hover" }}>



              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Candidate</TableCell>

              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Position</TableCell>

              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }} align="right">Approved</TableCell>

              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }} align="right">Offered CTC</TableCell>

              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }} align="right">Variance</TableCell>

              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Workflow</TableCell>

              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Approver</TableCell>

              <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: 11 }}>Comments</TableCell>



            </TableRow>



          </TableHead>



          <TableBody>



            {exceptions.map((row) => (



              <TableRow key={row.id} hover>



                <TableCell sx={{ py: 0.75 }}>



                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>

                    {row.candidate_name}

                  </Typography>



                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>

                    {row.req_code}

                  </Typography>



                </TableCell>



                <TableCell sx={{ py: 0.75, fontSize: 13 }}>{row.position}</TableCell>



                <TableCell align="right" sx={{ py: 0.75, fontSize: 13 }}>

                  {formatCurrency(row.approved_budget)}

                </TableCell>



                <TableCell align="right" sx={{ py: 0.75, fontSize: 13 }}>

                  {formatCurrency(row.offered_ctc)}

                </TableCell>



                <TableCell align="right" sx={{ py: 0.75 }}>



                  <Typography

                    variant="body2"

                    fontWeight={700}

                    sx={{ fontSize: 13 }}

                    color={row.variance_pct > 10 ? "error.main" : "warning.main"}

                  >

                    +{row.variance_pct}%

                  </Typography>



                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>

                    {formatCurrency(row.variance_amount)}

                  </Typography>



                </TableCell>



                <TableCell sx={{ py: 0.75 }}>

                  <WorkforceStatusChip status={row.workflow_status} />

                </TableCell>



                <TableCell sx={{ py: 0.75, fontSize: 13 }}>{row.approver}</TableCell>



                <TableCell sx={{ py: 0.75, maxWidth: 200 }}>

                  <Typography

                    variant="caption"

                    color="text.secondary"

                    noWrap

                    sx={{ fontSize: 12 }}

                  >

                    {row.comments}

                  </Typography>

                </TableCell>



              </TableRow>



            ))}



          </TableBody>



        </Table>



      </TableContainer>



    </ConfigSurface>



  );



}



export default BudgetExceptionTable;


