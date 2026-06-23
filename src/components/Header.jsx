import React from "react";

function Header({ userName, roleName }) {

  return (

    <div
      style={{
        height: "70px",
        background: "#1f3b63",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 30px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontFamily: "Segoe UI"
      }}
    >

      {/* IGS */}

      <div>

        <div
          style={{
            fontSize: "28px",
            fontWeight: "bold"
          }}
        >
          IGS
        </div>

        <div
          style={{
            fontSize: "11px",
            color: "#f39c12"
          }}
        >
          ENGINEERING QUALITY
        </div>

      </div>


      {/* OPTALYNX */}

      <div
        style={{
          textAlign: "center"
        }}
      >

        <div
          style={{
            fontSize: "26px",
            fontWeight: "600",
            letterSpacing: "2px"
          }}
        >
          OPTALYNX
        </div>

        <div
          style={{
            fontSize: "14px",
            color: "#dbeafe"
          }}
        >
          Linking Talent with Opportunity
        </div>

      </div>


      {/* USER */}

      <div
        style={{
          textAlign: "right",
          minWidth: "220px"
        }}
      >

        <div
          style={{
            fontWeight: "600"
          }}
        >
          {userName || ""}
        </div>

        <div
          style={{
            fontSize: "14px",
            color: "#dbeafe"
          }}
        >
          {roleName || ""}
        </div>

      </div>

    </div>

  );

}

export default Header;