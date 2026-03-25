import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { env } from "../config/env.js";

function parseAllowedOrigins(value) {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function securityMiddleware(app) {
  const allowedOrigins = parseAllowedOrigins(env.CORS_ORIGINS);

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", "https:", "data:"],
          formAction: ["'self'"],
          frameAncestors: ["'self'"],
          imgSrc: [
            "'self'",
            "data:",
            "https://images.unsplash.com",
            "http://localhost:5000",
            "https://7wkch12l-5000.inc1.devtunnels.ms",
          ],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          scriptSrcAttr: ["'none'"],
          styleSrc: ["'self'", "https:", "'unsafe-inline'"],
          upgradeInsecureRequests: [],
        },
      },
    })
  );

  app.use(compression());
  app.use(cookieParser());

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);

        const err = new Error("Not allowed by CORS");
        err.statusCode = 403;
        err.code = "CORS_FORBIDDEN";
        return cb(err);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
}