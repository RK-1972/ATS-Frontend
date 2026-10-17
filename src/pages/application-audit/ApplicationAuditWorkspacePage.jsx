import { useCallback, useEffect, useMemo, useState } from "react";

const APPLICATION_AUDIT_SEARCH_DEBOUNCE_MS = 300;



import {

  Alert,

  Box,

  Button,

  Chip,

  Divider,

  Grid,

  Stack,

  Tab,

  Tabs,

  TextField,

  Typography

} from "@mui/material";



import applicationAuditClient from "@/api/clients/applicationAuditClient";

import {

  EnterpriseDataGrid,

  InspectorDrawer,

  SearchBar,

  WorkspaceHeader,

  WorkspaceLayout

} from "@/components/enterprise";
import {
  normalizeApplicationAuditSearchTerm,
  resolveApplicationAuditSearchPlaceholder
} from "@/utils/applicationAuditSearch";

import AdminNavRail from "@/components/layout/AdminNavRail";

import RecruiterNavRail from "@/components/layout/RecruiterNavRail";

import TALeadNavRail from "@/components/layout/TALeadNavRail";

import OptalynxLoader from "@/components/OptalynxLoader";



function resolveEnterpriseNavRail(user) {

  let workspace = {};

  try {

    workspace = JSON.parse(localStorage.getItem("workspace") || "{}") || {};

  } catch {

    workspace = {};

  }



  if (workspace.showRecruitmentWorkspace || workspace.showInterviewWorkspace) {

    return <RecruiterNavRail loggedInUser={user} />;

  }



  if (workspace.showTaLeadWorkspace) {

    return <TALeadNavRail />;

  }



  return <AdminNavRail />;

}



function formatDateTime(value) {

  if (!value) {

    return "—";

  }



  try {

    return new Date(value).toLocaleString();

  } catch {

    return String(value);

  }

}



function defaultFromDateInputValue() {

  const from = new Date();

  from.setDate(from.getDate() - 15);

  return from.toISOString().slice(0, 10);

}



function formatDuration(seconds) {

  if (seconds == null || Number.isNaN(Number(seconds))) {

    return "—";

  }



  const total = Number(seconds);

  const hours = Math.floor(total / 3600);

  const minutes = Math.floor((total % 3600) / 60);

  const secs = total % 60;



  if (hours > 0) {

    return `${hours}h ${minutes}m`;

  }



  if (minutes > 0) {

    return `${minutes}m ${secs}s`;

  }



  return `${secs}s`;

}



function resolveEmployeeDisplayName(row) {

  if (!row) {

    return null;

  }



  return (

    row.user_name ||

    row.userName ||

    row.full_name ||

    row.fullName ||

    row.user ||

    null

  );

}



const auditDateFilterSx = {

  "& .MuiInputBase-root": {

    minHeight: 40

  }

};



function emptyDateInputSx(isEmpty) {

  if (!isEmpty) {

    return {};

  }



  return {

    "& input[type='date']::-webkit-datetime-edit": {

      color: "transparent"

    },

    "& input[type='date']:focus::-webkit-datetime-edit": {

      color: "inherit"

    }

  };

}



function DetailRow({ label, value }) {

  const display =

    value === null || value === undefined || value === ""

      ? "—"

      : typeof value === "object"

        ? JSON.stringify(value, null, 2)

        : String(value);



  return (

    <Box>

      <Typography

        variant="caption"

        color="text.secondary"

        sx={{ display: "block", mb: 0.25, fontWeight: 600 }}

      >

        {label}

      </Typography>

      <Typography

        variant="body2"

        sx={{ wordBreak: "break-word", overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}

      >

        {display}

      </Typography>

    </Box>

  );

}



function SectionHeading({ children }) {

  return (

    <Typography

      variant="overline"

      color="text.secondary"

      sx={{ fontWeight: 700, letterSpacing: 0.8, display: "block" }}

    >

      {children}

    </Typography>

  );

}



const SESSION_DETAIL_GROUPS = [

  {

    title: "Session",

    fields: [

      { key: "session_id", label: "Session ID" },

      { key: "status", label: "Status" },

      { key: "termination_reason", label: "Termination reason" }

    ]

  },

  {

    title: "User",

    fields: [

      { key: "employee_code", label: "Employee code" },

      {
        key: "employee_name",
        label: "Employee name",
        getValue: (row) => resolveEmployeeDisplayName(row)
      },

      { key: "email_id", label: "Account email" },

      { key: "user_id", label: "User ID" }

    ]

  },

  {

    title: "Activity",

    fields: [

      { key: "login_at", label: "Login", format: formatDateTime },

      { key: "logout_at", label: "Logout", format: formatDateTime },

      { key: "last_seen_at", label: "Last seen", format: formatDateTime },

      { key: "duration_seconds", label: "Duration", format: formatDuration }

    ]

  },

  {

    title: "Network",

    fields: [{ key: "source_ip", label: "Source IP" }]

  }

];



const SCREEN_DETAIL_GROUPS = [

  {

    title: "Activity",

    fields: [

      { key: "activity_id", label: "Activity ID" },

      { key: "screen_key", label: "Screen" },

      { key: "route_template", label: "Route" }

    ]

  },

  {

    title: "User",

    fields: [
      { key: "employee_code", label: "Employee code" },
      {
        key: "employee_name",
        label: "Employee name",
        getValue: (row) => resolveEmployeeDisplayName(row)
      }
    ]

  },

  {

    title: "Timing",

    fields: [

      { key: "entered_at", label: "Entered", format: formatDateTime },

      { key: "exited_at", label: "Exited", format: formatDateTime },

      { key: "last_visible_at", label: "Last visible", format: formatDateTime },

      { key: "duration_seconds", label: "Approx. duration", format: formatDuration }

    ]

  },

  {

    title: "Session",

    fields: [{ key: "session_id", label: "Session ID" }]

  }

];



const BUSINESS_DETAIL_GROUPS = [

  {

    title: "Event",

    fields: [

      { key: "id", label: "Audit ID" },

      { key: "timestamp", label: "Timestamp", format: formatDateTime },

      { key: "action", label: "Action" },

      { key: "outcome", label: "Outcome" },

      { key: "eventType", label: "Event type" }

    ]

  },

  {

    title: "User",

    fields: [

      { key: "employeeCode", label: "Employee code" },

      { key: "user", label: "Employee name" },

      { key: "role", label: "Role" }

    ]

  },

  {

    title: "Entity",

    fields: [

      { key: "module", label: "Module" },

      { key: "entity", label: "Entity" },

      { key: "entityId", label: "Entity / record ID" },

      { key: "correlationId", label: "Correlation ID" }

    ]

  },

  {

    title: "Change",

    fields: [

      { key: "changeSummary", label: "Change summary" },

      { key: "previousValue", label: "Previous value" },

      { key: "newValue", label: "New value" }

    ]

  }

];



function renderDetailGroups(groups, detail) {

  const knownKeys = new Set();

  groups.forEach((group) => {

    group.fields.forEach((field) => knownKeys.add(field.key));

  });



  const sections = groups.map((group) => (

    <Box key={group.title}>

      <SectionHeading>{group.title}</SectionHeading>

      <Stack spacing={1.5} sx={{ mt: 1, mb: 2 }}>

        {group.fields.map((field) => {

          const raw = field.getValue ? field.getValue(detail) : detail[field.key];

          const value = field.format ? field.format(raw) : raw;

          return <DetailRow key={field.key} label={field.label} value={value} />;

        })}

      </Stack>

    </Box>

  ));



  const extraEntries = Object.entries(detail).filter(

    ([key]) => key !== "id" && key !== "metadata" && !knownKeys.has(key)

  );



  if (extraEntries.length > 0) {

    sections.push(

      <Box key="additional">

        <Divider sx={{ mb: 2 }} />

        <SectionHeading>Additional fields</SectionHeading>

        <Stack spacing={1.5} sx={{ mt: 1 }}>

          {extraEntries.map(([key, value]) => (

            <DetailRow key={key} label={key} value={value} />

          ))}

        </Stack>

      </Box>

    );

  }



  return sections;

}



function resolveDetailTitle(tab, detail) {

  if (!detail) {

    return "Record detail";

  }



  if (tab === "sessions") {

    return detail.employee_code

      ? `Session · ${detail.employee_code}`

      : "Session detail";

  }



  if (tab === "screens") {

    return detail.screen_key ? `Screen · ${detail.screen_key}` : "Screen activity";

  }



  return detail.action ? `Audit · ${detail.action}` : "Business audit event";

}



function resolveDetailSubtitle(tab, detail) {

  if (!detail) {

    return "";

  }



  if (tab === "sessions") {

    return detail.session_id || "";

  }



  if (tab === "screens") {

    return detail.activity_id || "";

  }



  return detail.entityId || detail.id || "";

}



function ApplicationAuditWorkspacePage() {

  const [tab, setTab] = useState("sessions");

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [fromDate, setFromDate] = useState(defaultFromDateInputValue);

  const [toDate, setToDate] = useState("");

  const [status, setStatus] = useState("");

  const [outcome, setOutcome] = useState("");

  const [page, setPage] = useState(0);

  const [pageSize, setPageSize] = useState(25);

  const [rows, setRows] = useState([]);

  const [rowCount, setRowCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [detail, setDetail] = useState(null);



  const loggedInUser = useMemo(() => {

    try {

      return JSON.parse(localStorage.getItem("user") || "null");

    } catch {

      return null;

    }

  }, []);

  const searchPlaceholder = useMemo(
    () => resolveApplicationAuditSearchPlaceholder(tab),
    [tab]
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(normalizeApplicationAuditSearchTerm(search));
    }, APPLICATION_AUDIT_SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, tab]);

  const queryParams = useMemo(

    () => ({

      page: page + 1,

      limit: pageSize,

      search: debouncedSearch || undefined,

      from: fromDate || undefined,

      to: toDate || undefined,

      status: tab === "sessions" && status.trim() ? status.trim() : undefined,

      outcome: tab === "business" && outcome.trim() ? outcome.trim() : undefined

    }),

    [debouncedSearch, fromDate, toDate, outcome, page, pageSize, status, tab]

  );



  const loadData = useCallback(async () => {

    setLoading(true);

    setError("");



    try {

      let response;



      if (tab === "sessions") {

        response = await applicationAuditClient.listSessions(queryParams);

      } else if (tab === "screens") {

        response = await applicationAuditClient.listScreenActivity(queryParams);

      } else {

        response = await applicationAuditClient.listBusinessAuditEvents(queryParams);

      }



      const items = response?.data?.items || [];

      setRows(items);

      setRowCount(response?.data?.pagination?.total_count || 0);

    } catch (loadError) {

      setRows([]);

      setRowCount(0);

      setError(

        loadError?.response?.data?.message ||

          loadError.message ||

          "Unable to load audit history."

      );

    } finally {

      setLoading(false);

    }

  }, [queryParams, tab]);



  useEffect(() => {

    loadData();

  }, [loadData]);



  const employeeNameColumn = {

    field: "employee_name",

    headerName: "Employee Name",

    flex: 1,

    minWidth: 140,

    valueGetter: (_value, row) => resolveEmployeeDisplayName(row),

    valueFormatter: (value) => value || "—"

  };



  const sessionColumns = [

    { field: "employee_code", headerName: "Employee Code", flex: 0.9, minWidth: 120 },

    employeeNameColumn,

    { field: "email_id", headerName: "Account", flex: 1.2, minWidth: 160 },

    {

      field: "login_at",

      headerName: "Login",

      flex: 1.2,

      minWidth: 170,

      valueFormatter: (value) => formatDateTime(value)

    },

    {

      field: "source_ip",

      headerName: "Source IP",

      flex: 1,

      minWidth: 160,

      cellClassName: "application-audit-source-ip-cell",

      renderCell: (params) => (

        <Typography

          variant="body2"

          sx={{ py: 0.75, wordBreak: "break-all", overflowWrap: "anywhere", lineHeight: 1.35 }}

        >

          {params.value ?? "—"}

        </Typography>

      )

    },

    {

      field: "logout_at",

      headerName: "Logout",

      flex: 1.2,

      minWidth: 170,

      valueFormatter: (value) => formatDateTime(value)

    },

    {

      field: "duration_seconds",

      headerName: "Duration",

      flex: 0.7,

      minWidth: 100,

      valueFormatter: (value) => formatDuration(value)

    },

    { field: "status", headerName: "Status", flex: 0.8, minWidth: 110 }

  ];



  const screenColumns = [

    { field: "employee_code", headerName: "Employee Code", flex: 0.9, minWidth: 110 },

    employeeNameColumn,

    { field: "screen_key", headerName: "Screen", flex: 1.2, minWidth: 160 },

    { field: "route_template", headerName: "Route", flex: 1.2, minWidth: 160 },

    {

      field: "entered_at",

      headerName: "Entry",

      flex: 1,

      minWidth: 160,

      valueFormatter: (value) => formatDateTime(value)

    },

    {

      field: "exited_at",

      headerName: "Exit / Last seen",

      flex: 1,

      minWidth: 160,

      valueGetter: (_value, row) => row.exited_at || row.last_visible_at,

      valueFormatter: (value) => formatDateTime(value)

    },

    {

      field: "duration_seconds",

      headerName: "Approx. duration",

      flex: 0.8,

      minWidth: 120,

      valueFormatter: (value) => formatDuration(value)

    },

    { field: "session_id", headerName: "Session", flex: 1, minWidth: 120 }

  ];



  const businessColumns = [

    {

      field: "employeeCode",

      headerName: "Employee Code",

      flex: 0.8,

      minWidth: 110,

      valueGetter: (_value, row) => row.employeeCode || "—"

    },

    {

      field: "user",

      headerName: "Employee Name",

      flex: 1,

      minWidth: 140,

      valueFormatter: (value) => value || "—"

    },

    { field: "action", headerName: "Action", flex: 1.2, minWidth: 180 },

    {

      field: "entityId",

      headerName: "Entity / Record",

      flex: 1,

      minWidth: 140,

      valueGetter: (_value, row) =>

        [row.entity, row.entityId].filter(Boolean).join(" · ")

    },

    {

      field: "timestamp",

      headerName: "Timestamp",

      flex: 1,

      minWidth: 170,

      valueFormatter: (value) => formatDateTime(value)

    },

    { field: "outcome", headerName: "Outcome", flex: 0.6, minWidth: 90 },

    {

      field: "changeSummary",

      headerName: "Change summary",

      flex: 1.4,

      minWidth: 180,

      valueGetter: (_value, row) =>

        row.changeSummary ||

        [row.previousValue, row.newValue].filter(Boolean).join(" → ") ||

        "—"

    }

  ];



  const columns =

    tab === "sessions"

      ? sessionColumns

      : tab === "screens"

        ? screenColumns

        : businessColumns;



  const gridRows = rows.map((row, index) => ({

    id:

      row.session_id ||

      row.activity_id ||

      row.id ||

      `${tab}-${index}`,

    ...row

  }));



  const detailGroups =

    tab === "sessions"

      ? SESSION_DETAIL_GROUPS

      : tab === "screens"

        ? SCREEN_DETAIL_GROUPS

        : BUSINESS_DETAIL_GROUPS;



  return (

    <WorkspaceLayout navRail={resolveEnterpriseNavRail(loggedInUser)}>

      <Box sx={{ py: 2, px: { xs: 1, sm: 2 } }}>

        <WorkspaceHeader

          title="Application Audit & Session History"

          subtitle="Review login sessions, screen activity, and enterprise business audit events."

          statusChip={

            <Chip

              label={`${rowCount} records`}

              size="small"

              color="primary"

              variant="outlined"

              sx={{ fontWeight: 600, height: 24 }}

            />

          }

        />



        <Tabs

          value={tab}

          onChange={(_event, value) => {

            setTab(value);

            setPage(0);

            setDetail(null);

          }}

          sx={{ mb: 2 }}

        >

          <Tab value="sessions" label="Sessions" sx={{ textTransform: "none" }} />

          <Tab value="screens" label="Screen Activity" sx={{ textTransform: "none" }} />

          <Tab value="business" label="Business Audit Trail" sx={{ textTransform: "none" }} />

        </Tabs>



        <Grid container spacing={1.5} sx={{ mb: 2 }} alignItems="flex-start">

          <Grid size={{ xs: 12, md: 4 }}>

            <SearchBar

              value={search}

              onChange={(event) => setSearch(event.target.value)}

              placeholder={searchPlaceholder}

              width="100%"

              slotProps={{

                input: {

                  "aria-label": searchPlaceholder

                }

              }}

            />

          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>

            <TextField

              fullWidth

              size="small"

              type="date"

              label="From"

              slotProps={{ inputLabel: { shrink: true } }}

              value={fromDate}

              onChange={(event) => setFromDate(event.target.value)}

              sx={{ ...auditDateFilterSx, ...emptyDateInputSx(!fromDate) }}

            />

          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>

            <TextField

              fullWidth

              size="small"

              type="date"

              label="To"

              slotProps={{ inputLabel: { shrink: true } }}

              value={toDate}

              onChange={(event) => setToDate(event.target.value)}

              sx={{ ...auditDateFilterSx, ...emptyDateInputSx(!toDate) }}

            />

          </Grid>

          {tab === "sessions" ? (

            <Grid size={{ xs: 12, md: 2 }}>

              <TextField

                fullWidth

                size="small"

                label="Session status"

                placeholder="ACTIVE, EXPIRED…"

                value={status}

                onChange={(event) => setStatus(event.target.value)}

                sx={auditDateFilterSx}

              />

            </Grid>

          ) : null}

          {tab === "business" ? (

            <Grid size={{ xs: 12, md: 2 }}>

              <TextField

                fullWidth

                size="small"

                label="Outcome"

                placeholder="success / failure"

                value={outcome}

                onChange={(event) => setOutcome(event.target.value)}

                sx={auditDateFilterSx}

              />

            </Grid>

          ) : null}

          <Grid size={{ xs: 12, md: 2 }}>

            <Button

              fullWidth

              variant="contained"

              onClick={() => {

                setPage(0);

                loadData();

              }}

              sx={{ height: 40, textTransform: "none" }}

            >

              Apply filters

            </Button>

          </Grid>

        </Grid>



        {error ? (

          <Alert severity="error" sx={{ mb: 2 }}>

            {error}

          </Alert>

        ) : null}



        {loading ? (

          <Box

            sx={{

              width: "100%",

              height: "min(calc(100vh - 320px), 720px)",

              minHeight: 420,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              border: 1,

              borderColor: "divider",

              borderRadius: 2,

              bgcolor: "background.paper"

            }}

          >

            <OptalynxLoader />

          </Box>

        ) : (

          <EnterpriseDataGrid

            rows={gridRows}

            columns={columns}

            rowCount={rowCount}

            paginationMode="server"

            paginationModel={{ page, pageSize }}

            onPaginationModelChange={(model) => {

              setPage(model.page);

              setPageSize(model.pageSize);

            }}

            pageSizeOptions={[25, 50, 100]}

            onRowClick={(params) => setDetail(params.row)}

            disableRowSelectionOnClick

            getRowHeight={() => "auto"}

            getEstimatedRowHeight={() => 52}

            height="min(calc(100vh - 320px), 720px)"

            sx={{

              minHeight: 420,

              "& .MuiDataGrid-columnHeaders": { fontWeight: 700 },

              "& .MuiDataGrid-virtualScroller": {

                overflow: "auto"

              },

              "& .application-audit-source-ip-cell": {

                alignItems: "flex-start",

                py: 0.5

              }

            }}

          />

        )}



        <InspectorDrawer

          open={Boolean(detail)}

          onClose={() => setDetail(null)}

          title={resolveDetailTitle(tab, detail)}

          subtitle={resolveDetailSubtitle(tab, detail)}

        >

          {detail ? (

            <Stack spacing={0} divider={<Divider flexItem />}>

              {renderDetailGroups(detailGroups, detail)}

            </Stack>

          ) : null}

        </InspectorDrawer>

      </Box>

    </WorkspaceLayout>

  );

}



export default ApplicationAuditWorkspacePage;


