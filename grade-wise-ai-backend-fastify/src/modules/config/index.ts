import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { authenticate } from "../../hooks/authenticate.js";
import { authorize } from "../../hooks/authorize.js";
import { toHttpError } from "../../utils/errors.js";
import {
  getAllConfigs,
  getAiKeysSummary,
  getRawConfigValue,
  addAiKeys,
  setProviderModel,
  deleteAiKey,
  testAiKey,
  bulkUpdateConfigs,
} from "./config.service.js";
import { buildConfigKey } from "../../ai/constants.js";
import { decryptSecret } from "../../utils/crypto.js";

const ProviderEnum = z.enum(["gemini", "groq", "openai", "claude", "mistral", "deepseek"]);
const PurposeEnum = z.enum(["text", "pdf"]);

export default async function configModule(app: FastifyInstance) {
  const f = app.withTypeProvider<ZodTypeProvider>();
  const superAdminOnly = [authenticate, authorize("super_admin")];

  // GET /api/config
  f.get("/", { preHandler: superAdminOnly }, async (_req, reply) => {
    try {
      const data = await getAllConfigs();
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // POST /api/config/bulk-update
  f.post("/bulk-update", {
    preHandler: superAdminOnly,
    schema: {
      body: z.object({
        configs: z.array(z.object({ key: z.string(), value: z.string() })),
      }),
    },
  }, async (request, reply) => {
    try {
      await bulkUpdateConfigs(request.body.configs);
      return reply.send({ success: true, message: "Configuration updated." });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/config/ai-keys
  f.get("/ai-keys", { preHandler: superAdminOnly }, async (_req, reply) => {
    try {
      const data = await getAiKeysSummary();
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // GET /api/config/ai-summary  (alias)
  f.get("/ai-summary", { preHandler: superAdminOnly }, async (_req, reply) => {
    try {
      const data = await getAiKeysSummary();
      return reply.send({ success: true, data });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // POST /api/config/ai-keys/add
  f.post("/ai-keys/add", {
    preHandler: superAdminOnly,
    schema: {
      body: z.object({
        provider: ProviderEnum,
        purpose: PurposeEnum,
        keys: z.array(z.string().min(1)),
        model: z.string().min(1).optional(),
      }),
    },
  }, async (request, reply) => {
    try {
      const { added } = await addAiKeys(request.body.provider, request.body.purpose, request.body.keys);
      if (request.body.model) {
        await setProviderModel(request.body.provider, request.body.purpose, request.body.model);
      }
      return reply.send({ success: true, message: `Keys added for ${request.body.provider} (${request.body.purpose}).`, added });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // POST /api/config/ai-keys/model
  f.post("/ai-keys/model", {
    preHandler: superAdminOnly,
    schema: {
      body: z.object({
        provider: ProviderEnum,
        purpose: PurposeEnum,
        model: z.string().min(1),
      }),
    },
  }, async (request, reply) => {
    try {
      await setProviderModel(request.body.provider, request.body.purpose, request.body.model);
      return reply.send({ success: true, message: "Model updated." });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // DELETE /api/config/ai-keys
  f.delete("/ai-keys", {
    preHandler: superAdminOnly,
    schema: {
      body: z.object({
        provider: ProviderEnum,
        purpose: PurposeEnum,
        keyIndex: z.number().int().min(0),
      }),
    },
  }, async (request, reply) => {
    try {
      await deleteAiKey(request.body.provider, request.body.purpose, request.body.keyIndex);
      return reply.send({ success: true, message: "Key removed." });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // POST /api/config/ai-keys/test  (tests a stored key by index)
  f.post("/ai-keys/test", {
    preHandler: superAdminOnly,
    schema: {
      body: z.object({
        provider: ProviderEnum,
        purpose: PurposeEnum,
        keyIndex: z.number().int().min(0),
      }),
    },
  }, async (request, reply) => {
    try {
      const configKey = buildConfigKey(request.body.purpose, request.body.provider, "KEYS");
      const raw = await getRawConfigValue(configKey);
      const keys = (raw ?? "")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      const storedKey = keys[request.body.keyIndex];
      if (!storedKey) {
        return reply.code(404).send({ success: false, message: "No key found at that index." });
      }
      const result = await testAiKey(request.body.provider, decryptSecret(storedKey));
      return reply.send({
        success: result.success,
        message: result.error,
        latencyMs: result.latencyMs,
        modelUsed: result.model,
      });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });

  // POST /api/config/ai-keys/test-inline  (tests a user-provided key without saving)
  f.post("/ai-keys/test-inline", {
    preHandler: superAdminOnly,
    schema: {
      body: z.object({
        provider: ProviderEnum,
        apiKey: z.string().min(1),
        model: z.string().optional(),
      }),
    },
  }, async (request, reply) => {
    try {
      const result = await testAiKey(request.body.provider, request.body.apiKey, request.body.model);
      return reply.send({
        success: result.success,
        message: result.error,
        latencyMs: result.latencyMs,
        modelUsed: result.model,
      });
    } catch (err) {
      const { statusCode, message } = toHttpError(err);
      return reply.code(statusCode).send({ success: false, message });
    }
  });
}
