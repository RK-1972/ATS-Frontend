import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { Box, Button, Chip, Typography } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import ConfigSurface from "../../components/platform-config/ConfigSurface";
import BudgetExceptionTable from "../../components/workforce-planning/BudgetExceptionTable";
import WorkforcePlanningSectionSearch from "../../components/workforce-planning/WorkforcePlanningSectionSearch";
import { countPendingBudgetExceptions } from "@/utils/deriveWorkforceDashboardView";
import {
  BUDGET_EXCEPTION_SEARCH_FIELDS,
  filterItemsBySearch,
  normalizeWorkforceSearchQuery,
  WORKFORCE_PLANNING_RESULTS_SCROLL_SX
} from "@/utils/workforcePlanningListFilter";

function BudgetExceptionMonitorPage() {
  const { data } = useOutletContext();
  const [searchQuery, setSearchQuery] = useState("");

  const budgetExceptions = data?.budget_exceptions;

  const filteredExceptions = useMemo(
    () =>
      filterItemsBySearch(
        budgetExceptions ?? [],
        BUDGET_EXCEPTION_SEARCH_FIELDS,
        searchQuery
      ),
    [budgetExceptions, searchQuery]
  );

  const normalizedSearchQuery = normalizeWorkforceSearchQuery(searchQuery);
  const pending = countPendingBudgetExceptions(budgetExceptions ?? []);

  return (
    <>
      <ConfigPageHeader
        title="Budget exception monitor"
        subtitle="Offers exceeding approved budget trigger exception workflows before release."
        breadcrumbs={[
          { label: "Workforce Planning" },
          { label: "Budget Exceptions" }
        ]}
        statusChip={
          <Chip
            label={`${pending} pending approval`}
            color="error"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, height: 24 }}
          />
        }
      />

      <WorkforcePlanningSectionSearch
        label="Search budget exceptions"
        placeholder="Exception ID, candidate, position, department, requisition, status, approver…"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        onClear={() => setSearchQuery("")}
      />

      <Box sx={{ ...WORKFORCE_PLANNING_RESULTS_SCROLL_SX, mt: 1.5 }}>
        {filteredExceptions.length === 0 ? (
          <ConfigSurface sx={{ p: 2.5, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {(budgetExceptions?.length ?? 0) === 0
                ? "No budget exceptions to display."
                : normalizedSearchQuery
                  ? "No exceptions match your search. Try different keywords or clear the search."
                  : "No exceptions to display."}
            </Typography>
            {normalizedSearchQuery && (budgetExceptions?.length ?? 0) > 0 ? (
              <Button
                size="small"
                onClick={() => setSearchQuery("")}
                sx={{ mt: 1.5, textTransform: "none", fontWeight: 600 }}
              >
                Clear search
              </Button>
            ) : null}
          </ConfigSurface>
        ) : (
          <BudgetExceptionTable exceptions={filteredExceptions} />
        )}
      </Box>
    </>
  );
}

export default BudgetExceptionMonitorPage;
