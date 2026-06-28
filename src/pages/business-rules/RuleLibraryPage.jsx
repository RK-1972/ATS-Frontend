import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

import {
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Button
} from "@mui/material";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import ConfigSurface from "../../components/platform-config/ConfigSurface";
import RuleLibraryTable from "../../components/business-rules/RuleLibraryTable";

const CATEGORY_OPTIONS = [
  "all",
  "Recruitment",
  "Requisition",
  "Interview",
  "Offer",
  "Vendor",
  "Budget",
  "Notifications",
  "AI"
];

function RuleLibraryPage() {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    filteredRules,
    loadRuleForEdit,
    startNewRule
  } = useOutletContext();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {

    const paramCategory = searchParams.get("category");

    if (paramCategory) {
      setCategory(paramCategory);
    }

  }, [searchParams]);

  const rules = filteredRules(search, category);

  const handleEdit = (ruleId) => {
    loadRuleForEdit(ruleId);
    navigate("/business-rules/designer");
  };

  const handleSimulate = () => {
    navigate("/business-rules/simulator");
  };

  const handleNewRule = () => {
    startNewRule();
    navigate("/business-rules/designer");
  };

  return (

    <>

      <ConfigPageHeader
        title="Business Rule Library"
        subtitle="Search, filter, and manage all configured business rules across categories."
        breadcrumbs={[
          { label: "Business Rules" },
          { label: "Rule Library" }
        ]}
        statusChip={
          <Chip
            label={`${rules.length} rules`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        mb={1.5}
        alignItems={{ sm: "center" }}
      >

        <TextField
          placeholder="Search rules..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, maxWidth: 320 }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Category</InputLabel>
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat === "all" ? "All categories" : cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          size="small"
          startIcon={<AddOutlinedIcon />}
          onClick={handleNewRule}
          sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
        >
          New rule
        </Button>

      </Stack>

      <ConfigSurface sx={{ p: 0, overflow: "hidden" }}>

        <RuleLibraryTable
          rules={rules}
          onEdit={handleEdit}
          onSimulate={handleSimulate}
        />

      </ConfigSurface>

    </>

  );

}

export default RuleLibraryPage;
