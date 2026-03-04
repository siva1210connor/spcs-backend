import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { connectRedis } from "./config/redis.js";

async function bootstrap() {
  await connectRedis();
  await prisma.$connect();

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`API running on port ${env.PORT} (${env.NODE_ENV})`);
  });
}

bootstrap().catch((err) => {
  console.error("Startup error:", err);
  process.exit(1);
});