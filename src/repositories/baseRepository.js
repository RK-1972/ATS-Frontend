/**
 * Shared repository contract for enterprise domains.
 * Domain repositories extend these method names for backend parity.
 */

import { cloneData } from "@/utils/cloneData";

export const REPOSITORY_METHODS = [
  "getAll",
  "getById",
  "create",
  "update",
  "publish",
  "archive",
  "delete"
];

export { cloneData };

export function notImplemented(domain, method) {
  return Promise.reject(
    new Error(`${domain}.${method} is not implemented for live API yet.`)
  );
}

export default {
  REPOSITORY_METHODS,
  cloneData,
  notImplemented
};
