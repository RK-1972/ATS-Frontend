export const NOTIFICATION_CATEGORY_ORDER = [
  {
    key: "budget",
    label: "Budget"
  },
  {
    key: "resourceRequisition",
    label: "Resource Requisition"
  },
  {
    key: "candidateOwnership",
    label: "Candidate Ownership"
  },
  {
    key: "interviewScheduled",
    label: "Interview Scheduled"
  },
  {
    key: "assignedRequisition",
    label: "Assigned Requisition"
  }
];

const CATEGORY_LABEL_BY_KEY = NOTIFICATION_CATEGORY_ORDER.reduce(
  (accumulator, category) => {
    accumulator[category.key] = category.label;
    return accumulator;
  },
  {}
);

function parseNotificationTimestamp(notification) {
  const value =
    notification?.sortTimestamp
    ?? notification?.assigned_on
    ?? notification?.submitted_date
    ?? notification?.requested_on
    ?? null;

  if (!value) {
    return 0;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function sortNotificationsNewestFirst(notifications = []) {
  return notifications
    .map((notification, index) => ({ notification, index }))
    .sort((left, right) => {
      const timeDifference =
        parseNotificationTimestamp(right.notification)
        - parseNotificationTimestamp(left.notification);

      if (timeDifference !== 0) {
        return timeDifference;
      }

      return left.index - right.index;
    })
    .map(({ notification }) => notification);
}

function flattenGroupedNotifications(groupedNotifications = {}) {
  const items = [];

  NOTIFICATION_CATEGORY_ORDER.forEach((category) => {
    (groupedNotifications[category.key] || []).forEach((notification) => {
      items.push({
        ...notification,
        categoryKey: category.key,
        categoryLabel: category.label
      });
    });
  });

  return items;
}

/**
 * One global chronological feed — NOT grouped by category.
 * Category labels appear only when the category changes from the prior item.
 */
export function buildNotificationFeed(groupedNotifications = {}) {
  const sorted = sortNotificationsNewestFirst(
    flattenGroupedNotifications(groupedNotifications)
  );

  return sorted.map((item, index) => ({
    ...item,
    showCategoryLabel:
      index === 0 || sorted[index - 1].categoryKey !== item.categoryKey
  }));
}

export function countNotifications(feed = []) {
  return feed.length;
}

export function getNotificationCategoryLabel(categoryKey) {
  return CATEGORY_LABEL_BY_KEY[categoryKey] || categoryKey || "";
}
