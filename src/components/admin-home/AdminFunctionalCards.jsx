import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import DatasetOutlinedIcon from "@mui/icons-material/DatasetOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import { EnterpriseModuleCard, EnterpriseModuleGrid } from "@/components/enterprise";

const FUNCTIONAL_AREAS = [
  {
    key: "users",
    title: "User & Access Management",
    description: "Users · Roles · Permissions · Access assignments",
    icon: PeopleAltOutlinedIcon,
    module: "team",
    route: "/users"
  },
  {
    key: "security",
    title: "Security & Governance",
    description: "Security controls · Audit activity · Access exceptions",
    icon: PolicyOutlinedIcon,
    module: "reports",
    route: "/reports"
  },
  {
    key: "configuration",
    title: "Configuration Center",
    description: "Platform configuration · Business rules · Workflow configuration · Enterprise settings",
    icon: TuneOutlinedIcon,
    module: "configuration",
    route: "/platform-configuration"
  },
  {
    key: "master-data",
    title: "Master Data",
    description: "Organizations · Departments · Locations · Job and enterprise reference data",
    icon: DatasetOutlinedIcon,
    module: "master-data",
    route: "/master-data"
  },
  {
    key: "workforce",
    title: "Workforce Planning",
    description: "Workforce structures · Planning controls · Organizational configuration",
    icon: WorkOutlineOutlinedIcon,
    module: "workforce",
    route: "/workforce-planning"
  },
  {
    key: "workflow",
    title: "Workflow & Approvals",
    description: "Pending approvals · Workflow exceptions · Administrative attention items",
    icon: FactCheckOutlinedIcon,
    module: "approvals",
    route: "/business-rules"
  }
];

function AdminFunctionalCards({ onNavigate }) {
  return (
    <EnterpriseModuleGrid>
      {FUNCTIONAL_AREAS.map((area) => (
        <EnterpriseModuleCard
          key={area.key}
          title={area.title}
          description={area.description}
          icon={area.icon}
          module={area.module}
          actionLabel="Open"
          onAction={() => onNavigate?.(area.route)}
        />
      ))}
    </EnterpriseModuleGrid>
  );
}

export default AdminFunctionalCards;
