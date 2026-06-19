import { useState, useEffect } from "react";
import API from "../api/axios";

import {
  FaUserPlus,
  FaSearch,
  FaUserCheck,
  FaUsers,
  FaHandshake,
  FaFileSignature,
  FaCheckCircle
} from "react-icons/fa";

function ReportsAnalyticsPage() {

  const [dashboard, setDashboard] =
    useState({});

  const [selectedPeriod, setSelectedPeriod] =
    useState("month");

  const [funnelData, setFunnelData] =
    useState([]);

  // =========================================
  // Funnel Icons
  // =========================================

  const stageIcons = {

    "Applied": <FaUserPlus />,

    "Screening": <FaSearch />,

    "L1 Interview": <FaUserCheck />,

    "L2 Interview": <FaUsers />,

    "Client Interview": <FaHandshake />,

    "Offer": <FaFileSignature />,

    "Joined": <FaCheckCircle />

  };

  // =========================================
  // Funnel Colors
  // =========================================

  const stageColors = {

    "Applied": "#2563eb",

    "Screening": "#7c3aed",

    "L1 Interview": "#0891b2",

    "L2 Interview": "#0284c7",

    "Client Interview": "#f59e0b",

    "Offer": "#ea580c",

    "Joined": "#16a34a"

  };

  // =========================================
  // Load Data
  // =========================================

  useEffect(() => {

    fetchDashboardSummary(
      selectedPeriod
    );

    fetchFunnelData();

  }, [selectedPeriod]);

  // =========================================
  // Dashboard Summary
  // =========================================

  const fetchDashboardSummary =
    async (
      period = selectedPeriod
    ) => {

      try {

        const response =
          await API.get(
            `/dashboard-summary?period=${period}`
          );

        setDashboard(
          response.data.data
        );

      }

      catch (error) {

        console.log(error);

      }

    };

  // =========================================
  // Funnel Data
  // =========================================

  const fetchFunnelData = async () => {

    try {

      const response =
        await API.get(
          "/dashboard-funnel"
        );

      setFunnelData(
        response.data.data
      );

    }

    catch (error) {

      console.log(error);

    }

  };

  return (

    <div
      style={{
        padding: "24px",
        background: "#f3f4f6",
        minHeight: "100vh"
      }}
    >

      {/* PAGE TITLE */}

      <h1
        style={{
          fontSize: "32px",
          fontWeight: "600",
          marginBottom: "24px",
          color: "#111827"
        }}
      >
        Reports & Analytics
      </h1>

      {/* PERIOD */}

      <div
        style={{
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}
      >

        <span
          style={{
            fontWeight: "600",
            color: "#374151"
          }}
        >
          Period
        </span>

        <select
          value={selectedPeriod}
          onChange={(e) =>
            setSelectedPeriod(
              e.target.value
            )
          }
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: "white"
          }}
        >

          <option value="today">
            Today
          </option>

          <option value="week">
            This Week
          </option>

          <option value="month">
            This Month
          </option>

          <option value="quarter">
            This Quarter
          </option>

          <option value="year">
            This Year
          </option>

        </select>

      </div>

      {/* DASHBOARD */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "25px"
        }}
      >

        <DashboardCard
          title="👥 Total Candidates"
          value={dashboard.total_candidates || 0}
          bg="#eff6ff"
          border="#dbeafe"
          color="#1e40af"
        />

        <DashboardCard
          title="📋 Pipeline Records"
          value={dashboard.pipeline_records || 0}
          bg="#f5f3ff"
          border="#e9d5ff"
          color="#6d28d9"
        />

        <DashboardCard
          title="✅ Joined"
          value={dashboard.joined || 0}
          bg="#ecfdf5"
          border="#bbf7d0"
          color="#15803d"
        />

        <DashboardCard
          title="🎯 Offered"
          value={dashboard.offered || 0}
          bg="#fff7ed"
          border="#fed7aa"
          color="#ea580c"
        />

      </div>

      {/* FUNNEL */}

      <h2
        style={{
          marginTop: "25px",
          marginBottom: "15px",
          color: "#1f2937",
          fontSize: "24px",
          fontWeight: "600"
        }}
      >
        Recruitment Funnel
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px"
        }}
      >

        {funnelData.map((item) => (

          <div
            key={item.stage_name}
            style={{
              background:
                `${stageColors[item.stage_name]}08`,
              border:
                `1px solid ${stageColors[item.stage_name]}25`,
              borderRadius: "12px",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "70px",
              boxShadow:
                "0 2px 6px rgba(0,0,0,0.05)"
            }}
          >

            <div
              style={{
                fontSize: "20px",
                color:
                  stageColors[item.stage_name]
              }}
            >
              {stageIcons[item.stage_name]}
            </div>

            <div
              style={{
                fontSize: "13px",
                fontWeight: "600",
                marginTop: "6px",
                color: "#374151",
                textAlign: "center"
              }}
            >
              {item.stage_name}
            </div>

            <div
              style={{
                fontSize: "26px",
                fontWeight: "700",
                marginTop: "4px",
                color:
                  stageColors[item.stage_name]
              }}
            >
              {item.candidate_count}
            </div>

          </div>

        ))}

      </div>

    </div>

  );

}

function DashboardCard({

  title,
  value,
  bg,
  border,
  color

}) {

  return (

    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "10px",
        padding: "14px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >

      <div
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "26px",
          fontWeight: "700",
          color
        }}
      >
        {value}
      </div>

    </div>

  );

}

export default ReportsAnalyticsPage;