export function resolveFulfillment(req) {
  const fulfillment = req?.fulfillment || req;

  return {
    required: fulfillment.required_headcount ?? req.openings_count ?? 1,
    reserved: fulfillment.reserved_headcount ?? 0,
    filled: fulfillment.filled_headcount ?? 0,
    remaining: fulfillment.remaining_headcount ?? 0,
    closureStatus: fulfillment.closure_status ?? "Open",
    closureEligible: fulfillment.closure_eligible === true,
    dataQualityException: fulfillment.data_quality_exception === true
  };
}
