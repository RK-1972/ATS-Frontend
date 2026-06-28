import axios from "./axios.jsx";

import { isMockMode } from "./config";

export async function httpGet(url, mockHandler) {

  if (isMockMode() && mockHandler) {
    return mockHandler();
  }

  const response = await axios.get(url);
  return response.data;

}

export async function httpPost(url, body, mockHandler) {

  if (isMockMode() && mockHandler) {
    return mockHandler(body);
  }

  const response = await axios.post(url, body);
  return response.data;

}

export async function httpPut(url, body, mockHandler) {

  if (isMockMode() && mockHandler) {
    return mockHandler(body);
  }

  const response = await axios.put(url, body);
  return response.data;

}

export async function httpDelete(url, mockHandler) {

  if (isMockMode() && mockHandler) {
    return mockHandler();
  }

  const response = await axios.delete(url);
  return response.data;

}

export async function httpPatch(url, body, mockHandler) {

  if (isMockMode() && mockHandler) {
    return mockHandler(body);
  }

  const response = await axios.patch(url, body);
  return response.data;

}

export default {
  httpGet,
  httpPost,
  httpPut,
  httpDelete,
  httpPatch
};
