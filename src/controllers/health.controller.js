import { ok } from "../utils/apiResponse.js";

export function healthCheck(req, res) {
  return ok(res, { status: "ok" }, "Service healthy");
}