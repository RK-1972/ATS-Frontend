import documentPlaceholderClient from "@/api/clients/documentPlaceholderClient";

async function getPlaceholders() {
  const response = await documentPlaceholderClient.getPlaceholders();
  return response?.data || { groups: [], scalars: [], tables: [] };
}

const documentPlaceholderRepository = {
  getPlaceholders
};

export default documentPlaceholderRepository;
