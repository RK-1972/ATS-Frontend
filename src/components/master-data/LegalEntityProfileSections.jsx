import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
  MenuItem
} from "@mui/material";

import legalEntityProfileClient from "@/api/clients/legalEntityProfileClient";
import LegalEntityImagePreview from "./LegalEntityImagePreview";
import {
  createEmptyLegalEntityProfile,
  mapApiLegalEntityProfile,
  patchLegalEntityProfile
} from "@/enterprise/legalEntityProfileDefaults";
import { getPublishedRecords } from "@/enterprise/masterDataHelpers";

function SectionHeading({ title, subtitle }) {
  return (
    <Box sx={{ pt: 1 }}>
      <Typography variant="subtitle2" fontWeight={700} color="primary.main">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

function LegalEntityAssetUploader({
  label,
  recordId,
  assetPath,
  objectKey,
  onUploaded,
  onRemoved,
  disabled
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !recordId) {
      return;
    }

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError("Only PNG or JPEG images are supported.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be 2 MB or smaller.");
      return;
    }

    setError("");
    setBusy(true);

    try {
      const uploadFn =
        assetPath === "logo"
          ? legalEntityProfileClient.uploadLogo
          : legalEntityProfileClient.uploadSignature;

      const profile = await uploadFn(recordId, file);
      onUploaded(profile);
    } catch (uploadError) {
      setError(
        uploadError.response?.data?.message
          || uploadError.message
          || "Upload failed."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!recordId || !objectKey) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const removeFn =
        assetPath === "logo"
          ? legalEntityProfileClient.removeLogo
          : legalEntityProfileClient.removeSignature;

      const profile = await removeFn(recordId);
      onRemoved(profile);
    } catch (removeError) {
      setError(
        removeError.response?.data?.message
          || removeError.message
          || "Remove failed."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={1}>
      <Typography variant="body2" fontWeight={600}>
        {label}
      </Typography>

      {!recordId && (
        <Alert severity="info" variant="outlined">
          Save the legal entity master record before uploading {label.toLowerCase()}.
        </Alert>
      )}

      <LegalEntityImagePreview
        recordId={recordId}
        assetPath={assetPath}
        objectKey={objectKey}
        label={label}
      />

      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button
          component="label"
          variant="outlined"
          size="small"
          disabled={disabled || busy || !recordId}
        >
          {objectKey ? "Replace" : "Upload"}
          <input
            hidden
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFile}
          />
        </Button>

        {objectKey && (
          <Button
            variant="text"
            color="warning"
            size="small"
            disabled={disabled || busy}
            onClick={handleRemove}
          >
            Remove
          </Button>
        )}

        {busy && <CircularProgress size={20} />}
      </Stack>
    </Stack>
  );
}

function LegalEntityProfileSections({
  recordId,
  masterRecord,
  masterData,
  profile,
  onProfileChange,
  readOnly = false
}) {
  const profileReadOnly =
    readOnly || masterRecord?.versionStatus === "Archived";
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const countryOptions = useMemo(
    () => getPublishedRecords(masterData, "countries"),
    [masterData]
  );

  const updateField = useCallback(
    (field, value) => {
      onProfileChange(patchLegalEntityProfile(profile, field, value));
    },
    [onProfileChange, profile]
  );

  useEffect(() => {
    if (!recordId) {
      onProfileChange(createEmptyLegalEntityProfile(null));
      return undefined;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError("");

      try {
        const loaded = await legalEntityProfileClient.getProfile(recordId);
        if (!cancelled) {
          onProfileChange(mapApiLegalEntityProfile(loaded));
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error.response?.data?.message
              || error.message
              || "Unable to load legal entity profile."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when record changes only
  }, [recordId]);

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 3 }}>
        <CircularProgress size={28} />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Loading legal entity profile…
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {masterRecord?.versionStatus === "Published" && !profileReadOnly && (
        <Alert severity="info" variant="outlined">
          Saving profile or branding changes will return this legal entity to Draft until you publish again.
        </Alert>
      )}

      {profileReadOnly && masterRecord?.versionStatus === "Archived" && (
        <Alert severity="warning" variant="outlined">
          Archived legal entities are read-only. Roll back or republish the master record to edit the profile.
        </Alert>
      )}

      {loadError && (
        <Alert severity="warning" variant="outlined">
          {loadError}
        </Alert>
      )}

      <SectionHeading
        title="Legal Entity Profile"
        subtitle="Registration, address, branding and offer letter signatory details."
      />

      <SectionHeading title="Basic Information" />
      <Typography variant="caption" color="text.secondary">
        Registered legal name is stored in the master &quot;Name&quot; field above (
        {masterRecord?.name || "—"}).
      </Typography>

      <TextField
        select
        label="Country"
        size="small"
        value={profile.countryCode}
        onChange={(event) => updateField("countryCode", event.target.value)}
        fullWidth
        disabled={profileReadOnly}
        helperText="Primary country for this legal entity (optional)"
      >
        <MenuItem value="">—</MenuItem>
        {countryOptions.map((item) => (
          <MenuItem key={item.id} value={item.code}>
            {item.name}
          </MenuItem>
        ))}
      </TextField>

      <Divider />

      <SectionHeading
        title="Registration & Tax"
        subtitle="Indian identifiers are optional and validated only when supplied."
      />

      <TextField
        label="Company Registration Number"
        size="small"
        value={profile.companyRegistrationNumber}
        onChange={(event) =>
          updateField("companyRegistrationNumber", event.target.value)
        }
        fullWidth
        disabled={profileReadOnly}
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <TextField
          label="CIN (India, optional)"
          size="small"
          value={profile.cin}
          onChange={(event) => updateField("cin", event.target.value)}
          fullWidth
          disabled={profileReadOnly}
        />
        <TextField
          label="PAN (India, optional)"
          size="small"
          value={profile.pan}
          onChange={(event) => updateField("pan", event.target.value)}
          fullWidth
          disabled={profileReadOnly}
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <TextField
          label="TAN (India, optional)"
          size="small"
          value={profile.tan}
          onChange={(event) => updateField("tan", event.target.value)}
          fullWidth
          disabled={profileReadOnly}
        />
        <TextField
          label="GSTIN (India, optional)"
          size="small"
          value={profile.gstin}
          onChange={(event) => updateField("gstin", event.target.value)}
          fullWidth
          disabled={profileReadOnly}
        />
      </Stack>

      <TextField
        label="Place of Registration"
        size="small"
        value={profile.placeOfRegistration}
        onChange={(event) =>
          updateField("placeOfRegistration", event.target.value)
        }
        fullWidth
        disabled={profileReadOnly}
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <TextField
          label="Date of Incorporation"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={profile.dateOfIncorporation}
          onChange={(event) =>
            updateField("dateOfIncorporation", event.target.value)
          }
          fullWidth
          disabled={profileReadOnly}
        />
        <TextField
          label="Registration Jurisdiction"
          size="small"
          value={profile.registrationJurisdiction}
          onChange={(event) =>
            updateField("registrationJurisdiction", event.target.value)
          }
          fullWidth
          disabled={profileReadOnly}
        />
      </Stack>

      <Divider />

      <SectionHeading title="Registered Office Address" />

      <TextField
        label="Address Line 1"
        size="small"
        value={profile.addressLine1}
        onChange={(event) => updateField("addressLine1", event.target.value)}
        fullWidth
        disabled={profileReadOnly}
      />
      <TextField
        label="Address Line 2"
        size="small"
        value={profile.addressLine2}
        onChange={(event) => updateField("addressLine2", event.target.value)}
        fullWidth
        disabled={profileReadOnly}
      />
      <TextField
        label="Address Line 3"
        size="small"
        value={profile.addressLine3}
        onChange={(event) => updateField("addressLine3", event.target.value)}
        fullWidth
        disabled={profileReadOnly}
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <TextField
          label="City"
          size="small"
          value={profile.addressCity}
          onChange={(event) => updateField("addressCity", event.target.value)}
          fullWidth
          disabled={profileReadOnly}
        />
        <TextField
          label="State / Province"
          size="small"
          value={profile.addressState}
          onChange={(event) => updateField("addressState", event.target.value)}
          fullWidth
          disabled={profileReadOnly}
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <TextField
          label="Postal / PIN Code"
          size="small"
          value={profile.addressPostalCode}
          onChange={(event) =>
            updateField("addressPostalCode", event.target.value)
          }
          fullWidth
          disabled={profileReadOnly}
        />
        <TextField
          label="Country"
          size="small"
          value={profile.addressCountry}
          onChange={(event) => updateField("addressCountry", event.target.value)}
          fullWidth
          disabled={profileReadOnly}
        />
      </Stack>

      <Divider />

      <SectionHeading title="Official Contact Information" />

      <TextField
        label="Official Email Address"
        size="small"
        value={profile.officialEmail}
        onChange={(event) => updateField("officialEmail", event.target.value)}
        fullWidth
        disabled={profileReadOnly}
      />
      <TextField
        label="Official Contact Number"
        size="small"
        value={profile.officialPhone}
        onChange={(event) => updateField("officialPhone", event.target.value)}
        fullWidth
        disabled={profileReadOnly}
      />
      <TextField
        label="Website URL"
        size="small"
        value={profile.websiteUrl}
        onChange={(event) => updateField("websiteUrl", event.target.value)}
        fullWidth
        disabled={profileReadOnly}
      />

      <Divider />

      <SectionHeading
        title="Branding & Logo"
        subtitle="PNG or JPEG, max 2 MB. Entity-specific logo for future document branding."
      />

      <LegalEntityAssetUploader
        label="Entity Logo"
        recordId={recordId}
        assetPath="logo"
        objectKey={profile.logo?.objectKey}
        disabled={profileReadOnly}
        onUploaded={onProfileChange}
        onRemoved={onProfileChange}
      />

      <Divider />

      <SectionHeading
        title="Authorised Offer Letter Signatory"
        subtitle="Name and designation that will appear on generated offer letters."
      />

      <TextField
        label="Signatory Full Name"
        size="small"
        value={profile.signatoryFullName}
        onChange={(event) =>
          updateField("signatoryFullName", event.target.value)
        }
        fullWidth
        disabled={profileReadOnly}
      />
      <TextField
        label="Signatory Designation"
        size="small"
        value={profile.signatoryDesignation}
        onChange={(event) =>
          updateField("signatoryDesignation", event.target.value)
        }
        fullWidth
        disabled={profileReadOnly}
      />

      <LegalEntityAssetUploader
        label="Signature Image (optional)"
        recordId={recordId}
        assetPath="signature"
        objectKey={profile.signature?.objectKey}
        disabled={profileReadOnly}
        onUploaded={onProfileChange}
        onRemoved={onProfileChange}
      />
    </Stack>
  );
}

export default LegalEntityProfileSections;