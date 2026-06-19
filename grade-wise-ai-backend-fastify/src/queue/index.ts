import { Queue, Worker, type Job } from "bullmq";
import { isRedisEnabled } from "../lib/redis.js";
import { generateQuestionsForAttempt } from "../modules/student-assessments/generation.js";

export const ASSESSMENT_GENERATION_QUEUE = "assessment-generation";

let queue: Queue | null = null;

function getQueueConnection() {
  const url = process.env["REDIS_URL"];
  if (!url) return null;
  return { url };
}

export function getAssessmentQueue(): Queue | null {
  if (!isRedisEnabled()) return null;
  if (queue) return queue;

  const connection = getQueueConnection();
  if (!connection) return null;

  queue = new Queue(ASSESSMENT_GENERATION_QUEUE, { connection });
  return queue;
}

export type AssessmentGenerationJob = {
  attemptId: number;
  assessmentId: number;
  studentId: number;
  language: string;
};

export async function enqueueAssessmentGeneration(
  data: AssessmentGenerationJob
): Promise<boolean> {
  const q = getAssessmentQueue();
  if (!q) return false;

  await q.add("generate", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  });
  return true;
}

export function startAssessmentWorker(): Worker | null {
  if (!isRedisEnabled()) return null;

  const connection = getQueueConnection();
  if (!connection) return null;

  const worker = new Worker<AssessmentGenerationJob>(
    ASSESSMENT_GENERATION_QUEUE,
    async (job: Job<AssessmentGenerationJob>) => {
      await generateQuestionsForAttempt(job.data);
    },
    { connection, concurrency: 2 }
  );

  worker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
