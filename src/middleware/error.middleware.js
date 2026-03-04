import { env } from "../config/env.js";

export function notFound(req, res) {
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Route not found" } });
}

export function errorHandler(err, req, res, next) {
  const status = err.statusCode ?? 500;

  const payload = {
    success: false,
    error: {
      code: err.code ?? "SERVER_ERROR",
      message: err.message ?? "Something went wrong",
    },
  };

  if (env.NODE_ENV !== "production") {
    payload.error.stack = err.stack;
  }

  res.status(status).json(payload);
}