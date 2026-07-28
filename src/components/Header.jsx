import React from "react";

import AppHeader from "./layout/AppHeader";

/**
 * Compatibility wrapper — no independent branding or user chrome.
 * Authenticated pages should prefer AppHeader; Header delegates to it.
 */
function Header(props) {
  return <AppHeader {...props} />;
}

export default Header;
