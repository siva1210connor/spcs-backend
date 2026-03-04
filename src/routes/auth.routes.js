import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";
import {
  loginSchema,
  verifyOtpSchema,
  signUpSchema,
  refreshSchema,
  logoutSchema,
} from "../validators/auth.validator.js";
import { login, verifyOtp, signUp, refresh, logout } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", authRateLimiter, validate(loginSchema), login);
authRouter.post(
  "/verifyOtp",
  authRateLimiter,
  validate(verifyOtpSchema),
  verifyOtp,
);
authRouter.post("/signUp", authRateLimiter, validate(signUpSchema), signUp);

authRouter.post("/refresh", validate(refreshSchema), refresh);
authRouter.post("/logout", validate(logoutSchema), logout);
