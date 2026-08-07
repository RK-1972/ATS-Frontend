export function formatFormulaValue(component) {
  if (component.formulaType === "FIXED") {
    return component.fixedAmount != null
      ? Number(component.fixedAmount).toLocaleString("en-IN")
      : "—";
  }

  if (component.formulaValue != null && component.formulaValue !== "") {
    return String(component.formulaValue);
  }

  return "—";
}

export function mergeStructureWithSavedAmounts(structureComponents, savedBreakup = []) {
  const savedMap = Object.fromEntries(
    (Array.isArray(savedBreakup) ? savedBreakup : []).map((item) => [
      item.componentName || item.component_name,
      Number(item.amount || 0)
    ])
  );

  return (structureComponents || []).map((component) => {
    const defaultAmount =
      component.formulaType === "FIXED" && component.fixedAmount != null
        ? Number(component.fixedAmount)
        : 0;

    return {
      ...component,
      amount: savedMap[component.componentName] ?? defaultAmount
    };
  });
}

export function structureComponentsToCtcBreakup(structureComponents) {
  return (structureComponents || []).map((component, index) => ({
    componentName: component.componentName,
    amount: Number(component.amount || 0),
    displayOrder: component.displayOrder || index + 1
  }));
}

export function calculateStructureTotals(structureComponents) {
  const included = (structureComponents || []).filter(
    (component) => component.includeInCtc !== false
  );

  const totalCtc = included.reduce(
    (sum, component) => sum + Number(component.amount || 0),
    0
  );

  const gross = included
    .filter((component) => component.componentCategory === "EARNINGS")
    .reduce((sum, component) => sum + Number(component.amount || 0), 0);

  return {
    gross: Number(gross.toFixed(2)),
    totalCtc: Number(totalCtc.toFixed(2)),
    ctcBreakup: structureComponentsToCtcBreakup(structureComponents)
  };
}
