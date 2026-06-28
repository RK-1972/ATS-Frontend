import React from "react";

function OptalynxLogo({

  size = 52

}) {

  return (

    <svg

      width={size}

      height={size}

      viewBox="0 0 52 42"

      xmlns="http://www.w3.org/2000/svg"

    >

      {/* CONNECTIONS */}

      <line x1="18" y1="6" x2="5" y2="21" stroke="#F59E0B" strokeWidth="2.4"/>

      <line x1="18" y1="6" x2="31" y2="21" stroke="#F59E0B" strokeWidth="2.4"/>

      <line x1="5" y1="21" x2="31" y2="21" stroke="#F59E0B" strokeWidth="2.4"/>

      <line x1="18" y1="36" x2="5" y2="21" stroke="#F59E0B" strokeWidth="2.4"/>

      <line x1="18" y1="36" x2="31" y2="21" stroke="#F59E0B" strokeWidth="2.4"/>

      {/* Arrow */}

      <line

        x1="31"

        y1="21"

        x2="44"

        y2="21"

        stroke="#FFFFFF"

        strokeWidth="3"

        strokeLinecap="round"

      />

      <polygon

        points="49,21 42,16 42,26"

        fill="#FFFFFF"

      />

      {/* Nodes */}

      <circle cx="18" cy="6" r="3.8" fill="#F59E0B"/>

      <circle cx="5" cy="21" r="3.8" fill="#F59E0B"/>

      <circle cx="31" cy="21" r="3.8" fill="#F59E0B"/>

      <circle cx="18" cy="36" r="3.8" fill="#F59E0B"/>

    </svg>

  );

}

export default OptalynxLogo;