import axios from "axios";

import { API_BASE_URL } from "./config";
import {
  clearCandidateAuthStorage,
  getStoredCandidateToken,
  isTokenExpired
} from "../utils/candidateSessionAuth";

const candidateAPI = axios.create({
  baseURL: API_BASE_URL
});

candidateAPI.interceptors.request.use(
  (config) => {
    const token = getStoredCandidateToken();

    if (token) {
      if (isTokenExpired(token)) {
        clearCandidateAuthStorage();
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default candidateAPI;
