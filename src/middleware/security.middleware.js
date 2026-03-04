import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { env } from "../config/env.js";

export function securityMiddleware(app) {
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true); // allow mobile apps / postman
        if (env.CORS_ORIGINS.includes(origin)) return cb(null, true);

        const err = new Error("Not allowed by CORS");
        err.statusCode = 403;
        err.code = "CORS_FORBIDDEN";
        return cb(err);
      },
      credentials: true,
    })
  );
}