import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    phone: z.string().min(8).max(15),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(8).max(15),
    otp: z.string().length(4).or(z.string().length(6)),
  }),
});

export const signUpSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8).max(15),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(20),
    deviceId: z.string().optional(),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(20),
  }),
});