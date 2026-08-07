import { ENDPOINTS } from "../endpoints";
import { httpGet } from "../httpClient";

const documentPlaceholderClient = {
  getPlaceholders() {
    return httpGet(`${ENDPOINTS.documentPlaceholders}`, () => ({
      success: true,
      data: { groups: [], scalars: [], tables: [] }
    }));
  }
};

export default documentPlaceholderClient;
