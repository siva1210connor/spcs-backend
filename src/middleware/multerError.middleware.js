import multer from "multer";
import { makeError } from "../utils/error.js";

export function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return next(
          makeError("File size too large (max 5MB)", 400, "FILE_TOO_LARGE"),
        );

      case "LIMIT_UNEXPECTED_FILE":
        return next(makeError("Unexpected file field", 400, "UNEXPECTED_FILE"));

      default:
        return next(makeError(err.message, 400, "MULTER_ERROR"));
    }
  }

  // custom errors from fileFilter
  if (err.code === "INVALID_FILE_TYPE") {
    return next(err);
  }

  next(err);
}
