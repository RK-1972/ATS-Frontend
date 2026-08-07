import offerLetterClient from "@/api/clients/offerLetterClient";

async function getDetail(offerId) {
  const response = await offerLetterClient.getDetail(offerId);
  return response?.data || null;
}

const offerLetterRepository = {
  getDetail
};

export default offerLetterRepository;
