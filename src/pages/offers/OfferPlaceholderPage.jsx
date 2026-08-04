import { EmptyState, WorkspaceHeader } from "@/components/enterprise";

/**
 * Shared Offer Workspace placeholder section.
 * Future phases will replace EmptyState with real Offer functionality.
 */
function OfferPlaceholderPage({
  title,
  subtitle,
  emptyTitle,
  emptyDescription,
  icon,
  module = "offers"
}) {
  return (
    <>
      <WorkspaceHeader title={title} subtitle={subtitle} />
      <EmptyState
        icon={icon}
        module={module}
        title={emptyTitle}
        description={emptyDescription}
      />
    </>
  );
}

export default OfferPlaceholderPage;
