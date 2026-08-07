import documentClient from "@/api/clients/documentClient";

async function generateOfferDocument(offerId, templateId = null) {
  const response = await documentClient.generateDocument({
    businessObjectType: "OFFER",
    businessObjectId: offerId,
    templateId
  });

  return response?.data || null;
}

const generatedDocumentRepository = {
  generateOfferDocument
};

export default generatedDocumentRepository;
