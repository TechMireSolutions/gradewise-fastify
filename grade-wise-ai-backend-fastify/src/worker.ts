import "dotenv/config";
import { startAssessmentWorker } from "./queue/index.js";

const worker = startAssessmentWorker();

if (!worker) {
  console.error("[Worker] REDIS_URL is required to run the assessment worker.");
  process.exit(1);
}

console.log("[Worker] Assessment generation worker started");

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
