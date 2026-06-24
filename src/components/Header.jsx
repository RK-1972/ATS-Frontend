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
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginLeft: "auto"
  }}
>

  {/* LOGO */}

  <svg
    width="50"
    height="42"
    viewBox="0 0 50 42"
  >

    {/* CONNECTIONS */}

    <line
      x1="21"
      y1="6"
      x2="8"
      y2="21"
      stroke="#f39c12"
      strokeWidth="2"
    />

    <line
      x1="21"
      y1="6"
      x2="34"
      y2="21"
      stroke="#f39c12"
      strokeWidth="2"
    />

    <line
      x1="8"
      y1="21"
      x2="34"
      y2="21"
      stroke="#f39c12"
      strokeWidth="2"
    />

    <line
      x1="21"
      y1="36"
      x2="8"
      y2="21"
      stroke="#f39c12"
      strokeWidth="2"
    />

    <line
      x1="21"
      y1="36"
      x2="34"
      y2="21"
      stroke="#f39c12"
      strokeWidth="2"
    />

    {/* OPPORTUNITY ARROW */}

    <line
      x1="34"
      y1="21"
      x2="45"
      y2="21"
      stroke="#ffffff"
      strokeWidth="3"
    />

    <polygon
      points="50,21 43,16 43,26"
      fill="#ffffff"
    />

    {/* NODES */}

    <circle
      cx="21"
      cy="6"
      r="3.5"
      fill="#f39c12"
    />

    <circle
      cx="8"
      cy="21"
      r="3.5"
      fill="#f39c12"
    />

    <circle
      cx="34"
      cy="21"
      r="3.5"
      fill="#f39c12"
    />

    <circle
      cx="21"
      cy="36"
      r="3.5"
      fill="#f39c12"
    />

  </svg>

  {/* TEXT */}

  <div
    style={{
      textAlign: "left"
    }}
  >

    <div
      style={{
        fontSize: "26px",
        fontWeight: "600",
        letterSpacing: "2px",
        fontFamily: "Segoe UI"
      }}
    >
      OPTALYNX
    </div>

    <div
      style={{
        fontSize: "14px",
        color: "#dbeafe",
        fontFamily: "Segoe UI"
      }}
    >
      Linking Talent with Opportunity
    </div>

  </div>

</div>


      {userName && (

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
      {userName}
    </div>

    <div
      style={{
        fontSize: "14px",
        color: "#dbeafe"
      }}
    >
      {roleName}
    </div>

  </div>

)}
    </div>

  );

}

export default Header;