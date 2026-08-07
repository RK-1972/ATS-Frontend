export function formatApprovedDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function resolveOfferLetterQueueSelection(
  selectedOfferId,
  queueItems,
  previousOfferId = null
) {
  if (
    selectedOfferId &&
    queueItems.some((item) => item.offerId === selectedOfferId)
  ) {
    return selectedOfferId;
  }

  if (
    previousOfferId &&
    queueItems.some((item) => item.offerId === previousOfferId)
  ) {
    return previousOfferId;
  }

  return queueItems[0]?.offerId || null;
}
