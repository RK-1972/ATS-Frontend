import axios from "../axios.jsx";
import { isMockMode } from "../config";
import {
  createEmptyLegalEntityProfile,
  mapApiLegalEntityProfile
} from "@/enterprise/legalEntityProfileDefaults";

const BASE = "/api/v1/master/legal-entities";

async function getProfile(recordId) {
  if (isMockMode() || !recordId) {
    return createEmptyLegalEntityProfile(recordId);
  }

  const response = await axios.get(`${BASE}/${encodeURIComponent(recordId)}/profile`);
  return mapApiLegalEntityProfile(response.data?.data);
}

async function upsertProfile(recordId, profile) {
  if (isMockMode() || !recordId) {
    return mapApiLegalEntityProfile({ ...profile, recordId, hasProfile: true });
  }

  const response = await axios.put(
    `${BASE}/${encodeURIComponent(recordId)}/profile`,
  {
    countryCode: profile.countryCode,
    companyRegistrationNumber: profile.companyRegistrationNumber,
    cin: profile.cin,
    pan: profile.pan,
    tan: profile.tan,
    gstin: profile.gstin,
    placeOfRegistration: profile.placeOfRegistration,
    dateOfIncorporation: profile.dateOfIncorporation,
    registrationJurisdiction: profile.registrationJurisdiction,
    addressLine1: profile.addressLine1,
    addressLine2: profile.addressLine2,
    addressLine3: profile.addressLine3,
    addressCity: profile.addressCity,
    addressState: profile.addressState,
    addressPostalCode: profile.addressPostalCode,
    addressCountry: profile.addressCountry,
    officialEmail: profile.officialEmail,
    officialPhone: profile.officialPhone,
    websiteUrl: profile.websiteUrl,
    signatoryFullName: profile.signatoryFullName,
    signatoryDesignation: profile.signatoryDesignation
  }
  );

  return mapApiLegalEntityProfile(response.data?.data);
}

async function uploadLogo(recordId, file) {
  const formData = new FormData();
  formData.append("logo", file);

  const response = await axios.post(
    `${BASE}/${encodeURIComponent(recordId)}/logo`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return mapApiLegalEntityProfile(response.data?.data);
}

async function removeLogo(recordId) {
  const response = await axios.delete(
    `${BASE}/${encodeURIComponent(recordId)}/logo`
  );
  return mapApiLegalEntityProfile(response.data?.data);
}

async function uploadSignature(recordId, file) {
  const formData = new FormData();
  formData.append("signature", file);

  const response = await axios.post(
    `${BASE}/${encodeURIComponent(recordId)}/signature`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return mapApiLegalEntityProfile(response.data?.data);
}

async function removeSignature(recordId) {
  const response = await axios.delete(
    `${BASE}/${encodeURIComponent(recordId)}/signature`
  );
  return mapApiLegalEntityProfile(response.data?.data);
}

async function fetchAssetBlob(recordId, asset) {
  const response = await axios.get(
    `${BASE}/${encodeURIComponent(recordId)}/${asset}`,
    { responseType: "blob" }
  );
  return response.data;
}

const legalEntityProfileClient = {
  getProfile,
  upsertProfile,
  uploadLogo,
  removeLogo,
  uploadSignature,
  removeSignature,
  fetchAssetBlob
};

export default legalEntityProfileClient;