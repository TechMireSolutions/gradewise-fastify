"use client";

import { useState, useEffect, useCallback } from "react";
import {
  listAiKeys,
  getAiSummary,
  addAiKeys as apiAddAiKeys,
  setProviderModel as apiSetProviderModel,
  deleteAiKey as apiDeleteAiKey,
  testStoredAiKey,
  testInlineAiKey,
} from "@/features/ai-config/api.js";
import useModal from "@/hooks/useModal.js";

import {
  ALL_PROVIDERS,
  defaultModelMap,
  providerLabels,
  PROVIDER_META,
  providerTheme,
  buildInitialState,
  detectProvider,
} from "../constants/superAdminConstants.js";

export {
  ALL_PROVIDERS,
  defaultModelMap,
  providerLabels,
  PROVIDER_META,
  providerTheme,
  buildInitialState,
  detectProvider,
};

export default function useSuperAdminApiConfig() {
  const [aiState, setAiState] = useState(buildInitialState);
  const [configSubTab, setConfigSubTab] = useState("pdf");
  const [activeProvider, setActiveProvider] = useState({ pdf: "gemini", text: "gemini" });
  const [pendingKeyDelete, setPendingKeyDelete] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [modalInitialStep, setModalInitialStep] = useState(1);
  const [inlineTestStatus, setInlineTestStatus] = useState({});
  const [configLoading, setConfigLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const { modal, showModal, closeModal } = useModal();

  const openAddLlmModal = useCallback((prov = null, initialStep = 1, initialPurpose = null) => {
    if (initialPurpose) {
      setConfigSubTab(initialPurpose);
    }
    if (prov) {
      setActiveProvider((prev) => ({ ...prev, [initialPurpose || configSubTab]: prov }));
    }
    setModalInitialStep(initialStep);
    setIsSettingsModalOpen(true);
  }, [configSubTab]);

  const openSettingsModal = openAddLlmModal;

  const closeSettingsModal = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, []);

  const patchPP = useCallback((purpose, provider, patch) => {
    setAiState((prev) => ({
      ...prev,
      [purpose]: {
        ...prev[purpose],
        [provider]: { ...prev[purpose][provider], ...patch },
      },
    }));
  }, []);

  const refreshKeyList = useCallback(
    async (purpose, provider) => {
      try {
        const r = await listAiKeys(purpose, provider);
        if (r.success) {
          patchPP(purpose, provider, {
            list: r.keys || [],
            model: r.model || defaultModelMap[provider],
          });
        }
      } catch (e) {
        console.error(`Failed to load ${purpose}/${provider} keys:`, e);
      }
    },
    [patchPP]
  );

  const refreshAllKeyLists = useCallback(async () => {
    try {
      const summary = await getAiSummary();
      if (!summary.success) return;
      const promises = [];
      for (const pur of ["pdf", "text"]) {
        for (const prov of ALL_PROVIDERS) {
          const s = summary.summary[pur]?.[prov];
          if (!s) continue;
          patchPP(pur, prov, { model: s.model || defaultModelMap[prov] });
          if (s.count > 0) promises.push(refreshKeyList(pur, prov));
        }
      }
      await Promise.all(promises);
    } catch (e) {
      console.error("Failed to load AI summary:", e);
    }
  }, [patchPP, refreshKeyList]);

  useEffect(() => {
    refreshAllKeyLists();
  }, [refreshAllKeyLists]);

  const updateActiveCard = (field, value) => {
    const pur = configSubTab;
    const prov = activeProvider[pur];
    const patch = { [field]: value };
    if (field === "model") patch.modelManuallyChanged = true;
    if (field === "newKeys") {
      patch.keysDirty = true;
      const detected = detectProvider(value);
      if (detected) {
        const autoModel = defaultModelMap[detected];
        if (detected !== prov) {
          setActiveProvider((prev) => ({ ...prev, [pur]: detected }));
          patchPP(pur, detected, {
            newKeys: value,
            keysDirty: true,
            model: autoModel,
            detectedInfo: { provider: detected, model: autoModel },
          });
          patchPP(pur, prov, { newKeys: "", keysDirty: false });
          return;
        } else {
          if (!aiState[pur][prov].modelManuallyChanged) {
            patch.model = autoModel;
          }
          patch.detectedInfo = { provider: detected, model: autoModel };
        }
      } else {
        patch.detectedInfo = null;
      }
    }
    patchPP(pur, prov, patch);
  };

  const handleSaveLlm = async ({ purpose: targetPurpose, provider: targetProvider, key: targetKey, model: targetModel }) => {
    const pur = targetPurpose || configSubTab;
    const prov = targetProvider || activeProvider[pur];
    const keyToSave = typeof targetKey === "string" ? targetKey.trim() : "";
    const modelToSave = targetModel || aiState[pur]?.[prov]?.model || defaultModelMap[prov];

    try {
      setConfigLoading(true);
      let added = 0;
      let autoPickedModel = null;
      let autoPickedSource = null;

      if (keyToSave) {
        const r = await apiAddAiKeys(pur, prov, keyToSave, modelToSave);
        added = r.added || 0;
        autoPickedModel = r.autoPickedModel;
        autoPickedSource = r.autoPickedSource;
      } else if (modelToSave) {
        await apiSetProviderModel(pur, prov, modelToSave);
      }

      patchPP(pur, prov, {
        newKeys: "",
        keysDirty: false,
        model: modelToSave,
        modelManuallyChanged: false,
        detectedInfo: null,
      });

      // Switch active tab and provider so user sees the newly configured LLM immediately
      setConfigSubTab(pur);
      setActiveProvider((prev) => ({ ...prev, [pur]: prov }));

      await refreshKeyList(pur, prov);

      const purposeLabel = pur === "pdf" ? "PDF Reading" : "Text Generation";
      const providerLabel = providerLabels[prov] || prov;

      let msg = "";
      if (keyToSave) {
        msg = `${added} key${added === 1 ? "" : "s"} added to ${providerLabel} (${purposeLabel}) with active model "${modelToSave}".`;
        if (autoPickedModel && autoPickedSource && autoPickedSource !== "default") {
          msg += ` Verified model: ${autoPickedModel}.`;
        }
      } else {
        msg = `${providerLabel} model updated to "${modelToSave}" for ${purposeLabel}.`;
      }

      setIsSettingsModalOpen(false);
      showModal("success", "LLM Configured Successfully", msg);
      return { success: true };
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to configure LLM. Please try again.";
      showModal("error", "Configuration Rejected", msg);
      return { success: false, error: msg };
    } finally {
      setConfigLoading(false);
    }
  };

  const handleSaveCard = async () => {
    const pur = configSubTab;
    const prov = activeProvider[pur];
    const card = aiState[pur][prov];
    return handleSaveLlm({
      purpose: pur,
      provider: prov,
      key: card.newKeys,
      model: card.model,
    });
  };

  const handleTestStoredKey = async (purpose, provider, index) => {
    const card = aiState[purpose][provider];
    patchPP(purpose, provider, {
      testStatus: { ...card.testStatus, [index]: { state: "testing" } },
    });
    try {
      const r = await testStoredAiKey(purpose, provider, index);
      const status = {
        state: r.success ? "ok" : "fail",
        message: r.message,
        latencyMs: r.latencyMs,
        modelUsed: r.modelUsed,
        autoSwitchedModelFrom: r.autoSwitchedModelFrom,
      };
      setAiState((prev) => ({
        ...prev,
        [purpose]: {
          ...prev[purpose],
          [provider]: {
            ...prev[purpose][provider],
            testStatus: { ...prev[purpose][provider].testStatus, [index]: status },
          },
        },
      }));
      if (r.autoSwitchedModelFrom) await refreshKeyList(purpose, provider);
    } catch (e) {
      setAiState((prev) => ({
        ...prev,
        [purpose]: {
          ...prev[purpose],
          [provider]: {
            ...prev[purpose][provider],
            testStatus: {
              ...prev[purpose][provider].testStatus,
              [index]: { state: "fail", message: e?.response?.data?.message || e.message },
            },
          },
        },
      }));
    }
  };

  const handleDeleteStoredKey = (purpose, provider, index, snippet) => {
    setPendingKeyDelete({ purpose, provider, index, snippet });
    showModal(
      "warning",
      "Delete API Key?",
      `This will permanently remove key #${index + 1} (${snippet}) from the ${
        providerLabels[provider]
      } pool under ${purpose === "pdf" ? "PDF Reading" : "Text Generation"}. This cannot be undone.`
    );
  };

  const confirmDeleteKey = async () => {
    if (!pendingKeyDelete) return;
    const { purpose, provider, index } = pendingKeyDelete;
    try {
      setActionLoading(`delete-key-${purpose}-${provider}-${index}`);
      await apiDeleteAiKey(purpose, provider, index);
      await refreshKeyList(purpose, provider);
      setPendingKeyDelete(null);
      showModal("success", "Key Deleted", "API key removed from the pool.");
    } catch (err) {
      setPendingKeyDelete(null);
      showModal("error", "Error", err?.response?.data?.message || "Failed to delete key. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseModal = () => {
    setPendingKeyDelete(null);
    closeModal();
  };

  const handleTestInlineKey = async (overrideProv, overrideModel, overrideKey) => {
    const pur = configSubTab;
    const prov = overrideProv || activeProvider[pur];
    const card = aiState[pur]?.[prov] || {};
    const key = overrideKey !== undefined ? overrideKey : (card.newKeys || "").split(",")[0]?.trim();
    const model = overrideModel || card.model || defaultModelMap[prov];

    if (!key) {
      showModal("warning", "No key entered", "Enter an API key first to test the connection.");
      return null;
    }

    const id = `${pur}-${prov}`;
    setInlineTestStatus((s) => ({ ...s, [id]: { state: "testing" } }));
    try {
      const r = await testInlineAiKey(prov, model, key);
      const res = {
        state: r.success ? "ok" : "fail",
        message: r.message,
        latencyMs: r.latencyMs,
        modelUsed: r.modelUsed || model,
      };
      setInlineTestStatus((s) => ({ ...s, [id]: res }));
      return res;
    } catch (e) {
      const res = { state: "fail", message: e?.response?.data?.message || e.message };
      setInlineTestStatus((s) => ({ ...s, [id]: res }));
      return res;
    }
  };

  const purpose = configSubTab;
  const provider = activeProvider[purpose];
  const card = aiState[purpose][provider];
  const pStyle = providerTheme[provider];

  const totalPdfKeys = ALL_PROVIDERS.reduce((s, p) => s + aiState.pdf[p].list.length, 0);
  const totalTextKeys = ALL_PROVIDERS.reduce((s, p) => s + aiState.text[p].list.length, 0);
  const totalKeys = totalPdfKeys + totalTextKeys;
  const configuredCount = ALL_PROVIDERS.filter((p) => aiState[purpose][p].list.length > 0).length;

  return {
    aiState,
    configSubTab,
    setConfigSubTab,
    activeProvider,
    setActiveProvider,
    purpose,
    provider,
    card,
    pStyle,
    totalPdfKeys,
    totalTextKeys,
    totalKeys,
    configuredCount,
    configLoading,
    actionLoading,
    inlineTestStatus,
    pendingKeyDelete,
    isSettingsModalOpen,
    modalInitialStep,
    openAddLlmModal,
    openSettingsModal,
    closeSettingsModal,
    modal,
    closeModal: handleCloseModal,
    updateActiveCard,
    handleSaveCard,
    handleSaveLlm,
    handleTestStoredKey,
    handleDeleteStoredKey,
    confirmDeleteKey,
    handleTestInlineKey,
  };
}
