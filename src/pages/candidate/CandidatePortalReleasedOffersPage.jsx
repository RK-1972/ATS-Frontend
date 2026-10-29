import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

import AppHeader from "../../components/layout/AppHeader";
import OptalynxLoader from "../../components/OptalynxLoader";
import { EmptyState, EnterpriseSurface } from "@/components/enterprise";
import candidatePortalClient from "../../api/clients/candidatePortalClient";
import { formatCurrency } from "../../utils/formatCurrency";

const E4_DEFERRED_TOOLTIP =
  "Candidate responses will be enabled in a future enhancement.";

function formatPortalCtc(offer) {
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

function formatPortalOfferDate(value) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function DeferredResponseButton({ label }) {
  return (
    <Tooltip title={E4_DEFERRED_TOOLTIP}>
      <span>
        <Button variant="outlined" size="small" disabled sx={{ textTransform: "none" }}>
          {label}
        </Button>
      </span>
    </Tooltip>
  );
}

function CandidatePortalReleasedOffersPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await candidatePortalClient.listReleasedOffers();
        const rows = Array.isArray(response?.data) ? response.data : [];
        if (active) {
          setOffers(rows);
        }
      } catch (error) {
        if (active) {
          setOffers([]);
          setErrorMessage(
            error.response?.data?.message || "Failed to load your offers."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppHeader />

      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.5}>
          <Button
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={() => navigate("/candidate/workspace")}
            sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
          >
            Back to workspace
          </Button>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <LocalOfferOutlinedIcon color="primary" />
            <Typography variant="h5" fontWeight={700} color="primary.main">
              Your offers
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Released offer summaries are shown below. Accept, Decline, and Need clarification
            responses are not yet available.
          </Typography>

          {loading ? (
            <OptalynxLoader message="Loading offers…" />
          ) : errorMessage ? (
            <Alert severity="error">{errorMessage}</Alert>
          ) : offers.length === 0 ? (
            <EmptyState
              title="No released offers"
              description="When an authorized recruiter releases an offer to your portal, it will appear here."
            />
          ) : (
            <Grid container spacing={2}>
              {offers.map((offer) => (
                <Grid key={offer.offer_id} size={{ xs: 12 }}>
                  <EnterpriseSurface>
                    <Stack spacing={1.25}>
                      <Typography variant="overline" color="text.secondary">
                        {offer.requisition_code || "Requisition"} · {offer.offer_id}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {offer.position_title || "Offered position"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Offered CTC:</strong> {formatPortalCtc(offer)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Offer date:</strong> {formatPortalOfferDate(offer.offer_date)}
                      </Typography>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ pt: 1 }}>
                        <DeferredResponseButton label="Accept" />
                        <DeferredResponseButton label="Decline" />
                        <DeferredResponseButton label="Need clarification" />
                      </Stack>
                    </Stack>
                  </EnterpriseSurface>
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

export default CandidatePortalReleasedOffersPage;
