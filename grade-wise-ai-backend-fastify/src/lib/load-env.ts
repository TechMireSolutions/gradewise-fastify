import { config } from "dotenv";
import { resolve } from "node:path";

const isProduction = process.env["NODE_ENV"] === "production";
const envFile = isProduction ? ".env.production" : ".env.local";

config({ path: resolve(process.cwd(), envFile), quiet: true });
config({ quiet: true });
