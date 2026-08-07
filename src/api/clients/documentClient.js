import { ENDPOINTS } from "../endpoints";
import { httpPost } from "../httpClient";

const documentClient = {
  generateDocument(payload) {
    return httpPost(`${ENDPOINTS.documents}/generate`, payload);
  }
};

export default documentClient;
