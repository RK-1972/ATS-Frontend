import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Snackbar,
  Stack,
  Typography
} from "@mui/material";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import offerClient from "../api/clients/offerClient";
import AdminNavRail from "../components/layout/AdminNavRail";
import Header from "../components/Header";
import ConfigPageHeader from "@/components/platform-config/ConfigPageHeader";
import EnterpriseConfirmationDialog from "@/components/enterprise/EnterpriseConfirmationDialog";
import {
  EmptyState,
  EnterpriseSurface,
  LoadingState,
  SearchBar
} from "@/components/enterprise";
import { readWorkspaceFlags } from "@/enterprise/workspaceAvailability";
import { formatCurrency } from "../utils/formatCurrency";

function formatOfferCtc(offer) {
  const amount = Number(offer?.offered_ctc);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  const currency = String(offer?.currency || "INR").trim().toUpperCase();

  if (currency === "INR") {
    return formatCurrency(amount);
  }

  return `${currency} ${amount.toLocaleString("en-IN")}`;
}

function ReleaseOfferPage() {
  const workspace = readWorkspaceFlags();
  const canAccess = Boolean(workspace.showReleaseOfferWorkspace);

  const [searchQuery, setSearchQuery] = useState("");
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [confirmOffer, setConfirmOffer] = useState(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const releaseInFlightRef = useRef(false);
  const [toast, setToast] = useState({ message: "", severity: "success" });

  const loadOffers = useCallback(async (query) => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await offerClient.searchPortalReleaseOffers(query);
      const rows = Array.isArray(response?.data) ? response.data : [];
      setOffers(rows);
    } catch (error) {
      setOffers([]);
      setLoadError(
        error.response?.data?.message ||
          error.message ||
          "Failed to search eligible offers."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canAccess) {
      return;
    }

    const handle = window.setTimeout(() => {
      void loadOffers(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(handle);
  }, [canAccess, loadOffers, searchQuery]);

  const eligibleToRelease = useMemo(
    () => offers.filter((offer) => !offer.portal_released),
    [offers]
  );

  const handleConfirmRelease = async () => {
    if (!confirmOffer?.offer_id || releaseInFlightRef.current) {
      return;
    }

    releaseInFlightRef.current = true;
    setIsReleasing(true);

    try {
      const response = await offerClient.portalReleaseOffer(confirmOffer.offer_id);
      setToast({
        message:
          response?.message ||
          response?.toastMessage ||
          "Offer released to the candidate portal.",
        severity: "success"
      });
      setConfirmOffer(null);
      await loadOffers(searchQuery.trim());
    } catch (error) {
      setToast({
        message:
          error.response?.data?.message || "Failed to release offer to portal.",
        severity: "error"
      });
    } finally {
      releaseInFlightRef.current = false;
      setIsReleasing(false);
    }
  };

  if (!canAccess) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex" }}>
        <AdminNavRail />
        <Box component="main" sx={{ flex: 1, p: 3 }}>
          <Alert severity="warning">
            You need the Release Offer work assignment to access this page.
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Header />

      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        <AdminNavRail />

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            maxWidth: 1200,
            mx: "auto",
            px: { xs: 2, sm: 2.5 },
            py: { xs: 2, sm: 2.5 },
            width: "100%"
          }}
        >
          <ConfigPageHeader
            title="Release Offer"
            subtitle="Release generated offers to the correct candidate portal account."
            breadcrumbs={[
              { label: "Administration" },
              { label: "Offers" },
              { label: "Release Offer" }
            ]}
            statusChip={
              <Chip
                label={`${eligibleToRelease.length} ready to release`}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            }
          />

          <EnterpriseSurface sx={{ mb: 2 }}>
            <SearchBar
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search candidate, code, requisition, offer id, or position"
              width="100%"
            />
          </EnterpriseSurface>

          {loadError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loadError}
            </Alert>
          ) : null}

          {isLoading ? (
            <LoadingState message="Searching eligible offers…" />
          ) : offers.length === 0 ? (
            <EmptyState
              title="No eligible offers found"
              description="Only approved offers with generated letters appear here."
            />
          ) : (
            <Grid container spacing={2}>
              {offers.map((offer) => {
                const released = Boolean(offer.portal_released);

                return (
                  <Grid key={offer.offer_id} size={{ xs: 12, md: 6 }}>
                    <EnterpriseSurface sx={{ height: "100%" }}>
                      <Stack spacing={1.25}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={1}
                        >
                          <Box minWidth={0}>
                            <Typography variant="subtitle2" fontWeight={700} noWrap>
                              {offer.candidate_name || "Candidate"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {offer.candidate_code || "—"} · Offer {offer.offer_id}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={released ? "Released" : offer.offer_status}
                            color={released ? "success" : "default"}
                            variant="outlined"
                          />
                        </Stack>

                        <Typography variant="body2">
                          <strong>Requisition:</strong> {offer.requisition_code || "—"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Position:</strong> {offer.position_title || "—"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>CTC:</strong> {formatOfferCtc(offer)}
                        </Typography>

                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<SendOutlinedIcon />}
                          disabled={released || isReleasing}
                          onClick={() => setConfirmOffer(offer)}
                          sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
                        >
                          Release Offer
                        </Button>
                      </Stack>
                    </EnterpriseSurface>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Box>

      <EnterpriseConfirmationDialog
        open={Boolean(confirmOffer)}
        title="Release offer to candidate portal?"
        message={
          confirmOffer
            ? `Release offer ${confirmOffer.offer_id} for ${confirmOffer.candidate_name} on requisition ${confirmOffer.requisition_code}? The candidate will see position, CTC, and offer date in their portal. Accept, Decline, and clarification responses remain unavailable until a future release.`
            : ""
        }
        confirmLabel="Release Offer"
        loading={isReleasing}
        onClose={() => {
          if (!isReleasing) {
            setConfirmOffer(null);
          }
        }}
        onConfirm={handleConfirmRelease}
      />

      <Snackbar
        open={Boolean(toast.message)}
        autoHideDuration={4000}
        onClose={() => setToast({ message: "", severity: "success" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast({ message: "", severity: "success" })}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ReleaseOfferPage;
