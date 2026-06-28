import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Collapse,
  Chip
} from "@mui/material";

import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { useState } from "react";

import useMasterData from "@/hooks/useMasterData";

function MasterDataSidebar() {

  const {
    masterData,
    ui,
    selectMasterEntityType
  } = useMasterData();

  const [expandedDomains, setExpandedDomains] = useState(() =>
    Object.fromEntries(
      masterData.domains.map((domain) => [domain.key, domain.key === ui.selectedDomainKey])
    )
  );

  const toggleDomain = (domainKey) => {
    setExpandedDomains((prev) => ({
      ...prev,
      [domainKey]: !prev[domainKey]
    }));
  };

  return (

    <Box
      component="nav"
      aria-label="Master data categories"
      sx={{
        width: { xs: "100%", md: 260 },
        flexShrink: 0,
        bgcolor: "background.paper",
        borderRight: { md: 1 },
        borderColor: "divider",
        minHeight: { md: "calc(100vh - 82px)" },
        py: 1.5,
        overflowY: "auto"
      }}
    >

      <Box sx={{ px: 2, pb: 1.5 }}>

        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase"
          }}
        >
          Enterprise Master Data
        </Typography>

        <Typography
          variant="body2"
          fontWeight={700}
          color="primary.main"
          mt={0.25}
        >
          Reference Data Console
        </Typography>

      </Box>

      <List dense disablePadding sx={{ px: 1 }}>

        {masterData.domains.map((domain) => {

          const isExpanded = expandedDomains[domain.key];
          const recordCount = domain.entityTypes.reduce(
            (sum, entity) =>
              sum + (masterData.records[entity.key]?.length || 0),
            0
          );

          return (

            <Box key={domain.key}>

              <ListItemButton
                onClick={() => toggleDomain(domain.key)}
                sx={{ borderRadius: 1, py: 0.75 }}
              >
                <ListItemText
                  primary={domain.label}
                  primaryTypographyProps={{
                    fontWeight: 700,
                    fontSize: 13
                  }}
                />
                <Chip
                  label={recordCount}
                  size="small"
                  sx={{ height: 20, fontSize: 10, mr: 0.5 }}
                />
                {isExpanded ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
              </ListItemButton>

              <Collapse in={isExpanded} timeout="auto" unmountOnExit>

                <List dense disablePadding sx={{ pl: 1, pb: 0.5 }}>

                  {domain.entityTypes.map((entity) => {

                    const count = masterData.records[entity.key]?.length || 0;
                    const isSelected =
                      ui.selectedEntityType === entity.key &&
                      ui.selectedDomainKey === domain.key;

                    return (

                      <ListItemButton
                        key={entity.key}
                        selected={isSelected}
                        onClick={() =>
                          selectMasterEntityType(domain.key, entity.key)
                        }
                        sx={{
                          borderRadius: 1,
                          py: 0.5,
                          mb: 0.25,
                          "&.Mui-selected": {
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            "&:hover": {
                              bgcolor: "primary.dark"
                            }
                          }
                        }}
                      >
                        <ListItemText
                          primary={entity.label}
                          secondary={`${count} records`}
                          primaryTypographyProps={{
                            fontSize: 12,
                            fontWeight: isSelected ? 700 : 500
                          }}
                          secondaryTypographyProps={{
                            fontSize: 10,
                            color: isSelected ? "rgba(255,255,255,0.75)" : "text.secondary"
                          }}
                        />
                      </ListItemButton>

                    );

                  })}

                </List>

              </Collapse>

            </Box>

          );

        })}

      </List>

    </Box>

  );

}

export default MasterDataSidebar;
