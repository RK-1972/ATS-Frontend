import axios from "axios";

import { API_BASE_URL } from "./config";
import { clearAuthStorage, getStoredToken, isTokenExpired } from "../utils/sessionAuth";

const API = axios.create({

  baseURL: API_BASE_URL

});


// =====================================================
// Attach JWT Token Automatically
// =====================================================

API.interceptors.request.use(

  (config) => {

    const token = getStoredToken();

    if (token) {
      // Do not send an already-expired JWT; clear session eagerly
      // so route gates redirect without waiting for a 401.
      if (isTokenExpired(token)) {
        clearAuthStorage();
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;

  },

  (error) => {

    return Promise.reject(error);

  }

);

export default API;