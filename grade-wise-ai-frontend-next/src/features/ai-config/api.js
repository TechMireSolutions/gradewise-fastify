import apiClient from "@/lib/apiClient.js";

export const getAllConfigs = async () => {
  const response = await apiClient.get("/config");
  return response.data;
};

export const updateConfig = async (configData) => {
  const response = await apiClient.post("/config/update", configData);
  return response.data;
};

export const bulkUpdateConfigs = async (configs) => {
  const response = await apiClient.post("/config/bulk-update", { configs });
  return response.data;
};

export const listAiKeys = async (purpose, provider) => {
  const response = await apiClient.get("/config/ai-summary");
  const raw = response.data;
  if (!raw.success || !Array.isArray(raw.data)) return { success: false, keys: [], model: null };
  const entry = raw.data.find((e) => e.provider === provider);
  const p = entry?.purposes.find((pur) => pur.purpose === purpose);
  return {
    success: true,
    keys: (p?.maskedKeys || []).map((snippet, i) => ({ index: i, snippet })),
    model: p?.model || null,
  };
};

export const getAiSummary = async () => {
  const response = await apiClient.get("/config/ai-summary");
  const raw = response.data;
  if (!raw.success || !Array.isArray(raw.data)) return { success: false, summary: {} };
  const summary = { text: {}, pdf: {} };
  for (const entry of raw.data) {
    for (const p of entry.purposes) {
      summary[p.purpose][entry.provider] = { count: p.keyCount, model: p.model };
    }
  }
  return { success: true, summary };
};

export const addAiKeys = async (purpose, provider, keys, model) => {
  const keysArray = typeof keys === "string"
    ? keys.split(",").map(k => k.trim()).filter(Boolean)
    : keys;
  const response = await apiClient.post("/config/ai-keys/add", { purpose, provider, keys: keysArray, model });
  return response.data;
};

export const setProviderModel = async (purpose, provider, model) => {
  const response = await apiClient.post("/config/ai-keys/model", { purpose, provider, model });
  return response.data;
};

export const deleteAiKey = async (purpose, provider, index) => {
  const response = await apiClient.delete("/config/ai-keys", { data: { purpose, provider, keyIndex: index } });
  return response.data;
};

export const testStoredAiKey = async (purpose, provider, index) => {
  const response = await apiClient.post("/config/ai-keys/test", { purpose, provider, keyIndex: index });
  return response.data;
};

export const testInlineAiKey = async (provider, model, key) => {
  const response = await apiClient.post("/config/ai-keys/test-inline", { provider, model, apiKey: key });
  return response.data;
};
