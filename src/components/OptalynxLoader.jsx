import React from "react";

function OptalynxLoader({

  size = 40,

  text = ""

}) {

  return (

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px"
      }}
    >

      <svg
        width={size}
        height={size}
        viewBox="0 0 42 42"
        style={{
          animation:
            "optalynxSpin 1.2s linear infinite"
        }}
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
  x2="48"
  y2="21"
  stroke="#ffffff"
  strokeWidth="2.5"
  strokeLinecap="round"
/>

<polygon
  points="42,21 37,17 37,25"
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

      {text && (

        <div
          style={{
            color: "#1f3b63",
            fontSize: "14px",
            fontWeight: "500"
          }}
        >
          {text}
        </div>

      )}

      <style>
        {`

          @keyframes optalynxSpin {

            from {

              transform: rotate(0deg);

            }

            to {

              transform: rotate(360deg);

            }

          }

        `}
      </style>

    </div>

  );

}

export default OptalynxLoader;