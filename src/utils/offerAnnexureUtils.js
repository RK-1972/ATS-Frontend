/**
 * Single source of truth for Offer Summary Annexure-A layout.
 * Add future components (LTA, Food Allowance, etc.) here only.
 */

const VISIBILITY = {
  ALWAYS: "always",
  MANDATORY: "mandatory",
  OPTIONAL: "optional"
};

const ROW_KIND = {
  SECTION_HEADER: "section-header",
  DATA: "data",
  DIVIDER: "divider"
};

const EARNINGS_ROWS = [
  { id: "basic", label: "Basic", componentKey: "Basic", visibility: VISIBILITY.ALWAYS },
  { id: "hra", label: "HRA", componentKey: "HRA", visibility: VISIBILITY.ALWAYS },
  {
    id: "conveyance",
    label: "Conveyance",
    componentKey: "Conveyance",
    visibility: VISIBILITY.ALWAYS
  },
  {
    id: "medical-reimbursement",
    label: "Medical Reimbursement",
    componentKey: "Medical Reimbursement",
    visibility: VISIBILITY.ALWAYS
  },
  {
    id: "education",
    label: "Education",
    componentKey: "Education",
    visibility: VISIBILITY.ALWAYS
  },
  {
    id: "special-allowance",
    label: "Special Allowance",
    componentKey: "Special Allowance",
    visibility: VISIBILITY.ALWAYS
  }
];

const CONTRIBUTION_ROWS = [
  {
    id: "provident-fund",
    label: "Provident Fund",
    componentKey: "Employer PF",
    visibility: VISIBILITY.MANDATORY
  },
  {
    id: "gratuity",
    label: "Gratuity",
    componentKey: "Gratuity",
    visibility: VISIBILITY.MANDATORY
  },
  {
    id: "mediclaim-insurance",
    label: "Mediclaim Insurance",
    componentKey: "Mediclaim Insurance",
    visibility: VISIBILITY.ALWAYS
  },
  {
    id: "esic",
    label: "ESIC",
    componentKey: "ESIC",
    visibility: VISIBILITY.MANDATORY
  },
  {
    id: "statutory-bonus",
    label: "Statutory Bonus",
    componentKey: "Statutory Bonus",
    visibility: VISIBILITY.MANDATORY
  },
  {
    id: "monthly-fixed-incentive",
    label: "Monthly Fixed Incentive",
    componentKey: "Monthly Fixed Incentive",
    visibility: VISIBILITY.OPTIONAL,
    defaultAnnual: 0
  }
];

const ANNEXURE_LAYOUT = [
  {
    id: "earnings-section",
    sectionTitle: "Earnings",
    rows: EARNINGS_ROWS
  },
  {
    id: "gross-total",
    dividerBefore: true,
    dividerAfter: true,
    row: {
      id: "gross-salary",
      label: "Gross Salary",
      source: "gross",
      bold: true
    }
  },
  {
    id: "contributions-section",
    sectionTitle: "Company's Contribution",
    rows: CONTRIBUTION_ROWS
  },
  {
    id: "company-contribution-total",
    dividerBefore: true,
    dividerAfter: true,
    row: {
      id: "company-contribution",
      label: "Company's Contribution",
      source: "companyContribution",
      bold: true
    }
  },
  {
    id: "final-totals-section",
    sectionTitle: "Final Totals",
    rows: [
      {
        id: "total-monthly-ctc",
        label: "Total Monthly CTC",
        source: "totalMonthlyCtc",
        bold: true,
        highlight: true,
        monthlyOnly: true
      },
      {
        id: "total-annual-ctc",
        label: "Total Annual CTC",
        source: "totalAnnualCtc",
        bold: true,
        highlight: true,
        annualOnly: true
      }
    ]
  }
];

function roundAmount(value) {
  return Number(Number(value || 0).toFixed(2));
}

function toMonthly(annual) {
  return roundAmount(annual / 12);
}

function isZeroAmount(annual) {
  return roundAmount(annual) === 0;
}

function shouldShowRow(definition, annual) {
  if (definition.visibility === VISIBILITY.OPTIONAL) {
    return !isZeroAmount(annual);
  }

  return true;
}

function resolveAnnualAmount(amountByName, definition) {
  if (!definition.componentKey) {
    return roundAmount(definition.defaultAnnual || 0);
  }

  return roundAmount(amountByName[definition.componentKey] ?? definition.defaultAnnual ?? 0);
}

function buildDataRow(definition, amountByName) {
  const annual = resolveAnnualAmount(amountByName, definition);

  if (!shouldShowRow(definition, annual)) {
    return null;
  }

  return {
    kind: ROW_KIND.DATA,
    id: definition.id,
    label: definition.label,
    monthly: toMonthly(annual),
    annual,
    bold: Boolean(definition.bold),
    highlight: Boolean(definition.highlight),
    monthlyOnly: Boolean(definition.monthlyOnly),
    annualOnly: Boolean(definition.annualOnly)
  };
}

function buildComputedRow(definition, values) {
  const annual = roundAmount(values[definition.source]?.annual ?? 0);
  const monthly = roundAmount(values[definition.source]?.monthly ?? toMonthly(annual));

  return {
    kind: ROW_KIND.DATA,
    id: definition.id,
    label: definition.label,
    monthly: definition.annualOnly ? null : monthly,
    annual: definition.monthlyOnly ? null : annual,
    bold: Boolean(definition.bold),
    highlight: Boolean(definition.highlight),
    monthlyOnly: Boolean(definition.monthlyOnly),
    annualOnly: Boolean(definition.annualOnly)
  };
}

export function formatAnnexureAmount(amount) {
  return Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function buildAnnexureLayout(components, gross, totalCtc) {
  const amountByName = Object.fromEntries(
    (components || []).map((item) => [item.componentName, Number(item.amount || 0)])
  );

  const visibleContributionRows = CONTRIBUTION_ROWS.map((definition) =>
    buildDataRow(definition, amountByName)
  ).filter(Boolean);

  const companyContributionAnnual = visibleContributionRows.reduce(
    (sum, row) => sum + row.annual,
    0
  );

  const grossAnnual = roundAmount(gross || 0);
  const totalAnnual = roundAmount(totalCtc || 0);

  const computedValues = {
    gross: {
      monthly: toMonthly(grossAnnual),
      annual: grossAnnual
    },
    companyContribution: {
      monthly: toMonthly(companyContributionAnnual),
      annual: roundAmount(companyContributionAnnual)
    },
    totalMonthlyCtc: {
      monthly: toMonthly(totalAnnual),
      annual: null
    },
    totalAnnualCtc: {
      monthly: null,
      annual: totalAnnual
    }
  };

  const layout = [];

  ANNEXURE_LAYOUT.forEach((block) => {
    if (block.dividerBefore) {
      layout.push({ kind: ROW_KIND.DIVIDER, id: `${block.id}-divider-before` });
    }

    if (block.sectionTitle) {
      layout.push({
        kind: ROW_KIND.SECTION_HEADER,
        id: `${block.id}-header`,
        label: block.sectionTitle
      });
    }

    if (block.rows) {
      block.rows.forEach((definition) => {
        const row = definition.source
          ? buildComputedRow(definition, computedValues)
          : buildDataRow(definition, amountByName);

        if (row) {
          layout.push(row);
        }
      });
    }

    if (block.row) {
      layout.push(buildComputedRow(block.row, computedValues));
    }

    if (block.dividerAfter) {
      layout.push({ kind: ROW_KIND.DIVIDER, id: `${block.id}-divider-after` });
    }
  });

  return layout;
}

export function hasAnnexureBreakup(components) {
  return (components || []).some((item) => item.includeInCtc !== false);
}

export const annexureRowKind = ROW_KIND;
