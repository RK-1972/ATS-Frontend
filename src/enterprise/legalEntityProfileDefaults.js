export function createEmptyLegalEntityProfile(recordId = null) {
  return {
    recordId,
    countryCode: "",
    companyRegistrationNumber: "",
    cin: "",
    pan: "",
    tan: "",
    gstin: "",
    placeOfRegistration: "",
    dateOfIncorporation: "",
    registrationJurisdiction: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    addressCity: "",
    addressState: "",
    addressPostalCode: "",
    addressCountry: "",
    officialEmail: "",
    officialPhone: "",
    websiteUrl: "",
    signatoryFullName: "",
    signatoryDesignation: "",
    hasProfile: false,
    logo: {
      objectKey: null,
      fileName: null
    },
    signature: {
      objectKey: null,
      fileName: null
    }
  };
}

export function mapApiLegalEntityProfile(data) {
  if (!data) {
    return createEmptyLegalEntityProfile();
  }

  return {
    recordId: data.recordId,
    countryCode: data.countryCode || "",
    companyRegistrationNumber: data.companyRegistrationNumber || "",
    cin: data.cin || "",
    pan: data.pan || "",
    tan: data.tan || "",
    gstin: data.gstin || "",
    placeOfRegistration: data.placeOfRegistration || "",
    dateOfIncorporation: data.dateOfIncorporation || "",
    registrationJurisdiction: data.registrationJurisdiction || "",
    addressLine1: data.addressLine1 || "",
    addressLine2: data.addressLine2 || "",
    addressLine3: data.addressLine3 || "",
    addressCity: data.addressCity || "",
    addressState: data.addressState || "",
    addressPostalCode: data.addressPostalCode || "",
    addressCountry: data.addressCountry || "",
    officialEmail: data.officialEmail || "",
    officialPhone: data.officialPhone || "",
    websiteUrl: data.websiteUrl || "",
    signatoryFullName: data.signatoryFullName || "",
    signatoryDesignation: data.signatoryDesignation || "",
    hasProfile: Boolean(data.hasProfile),
    logo: data.logo || { objectKey: null, fileName: null },
    signature: data.signature || { objectKey: null, fileName: null }
  };
}

export function patchLegalEntityProfile(profile, field, value) {
  return {
    ...profile,
    [field]: value
  };
}