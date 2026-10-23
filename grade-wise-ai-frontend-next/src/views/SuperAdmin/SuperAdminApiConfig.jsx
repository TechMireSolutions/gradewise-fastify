"use client";

import { cn } from "@/lib/cn.js";
import { iconBadge, page, pageInner } from "@/lib/ui.js";
import { Modal, Button } from "@/components/ui";
import { FaKey } from "react-icons/fa";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import useSuperAdminApiConfig from "./hooks/useSuperAdminApiConfig.js";
import ApiConfigSidebar from "./components/ApiConfigSidebar.jsx";
import StoredKeysTable from "./components/StoredKeysTable.jsx";
import AddNewLlmModal from "./components/AddNewLlmModal.jsx";

export default function SuperAdminApiConfig() {
  const {
    aiState,
    setConfigSubTab,
    setActiveProvider,
    purpose,
    provider,
    totalPdfKeys,
    totalTextKeys,
    totalKeys,
    configuredCount,
    configLoading,
    actionLoading,
    pendingKeyDelete,
    isSettingsModalOpen,
    modalInitialStep,
    openSettingsModal,
    closeSettingsModal,
    modal,
    closeModal,
    handleSaveLlm,
    handleTestStoredKey,
    handleDeleteStoredKey,
    confirmDeleteKey,
    handleTestInlineKey,
  } = useSuperAdminApiConfig();

  return (
    <div className={page}>
      <AmbientBackground />

      <MainLandmark className={pageInner}>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", iconBadge)}>
                <FaKey className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                  Super Admin
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight text-balance">
                  API Key Configuration
                </h1>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed text-pretty">
                  Manage AI provider API keys and models for PDF extraction and educational text generation.
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3 flex-shrink-0">
              <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-3 sm:p-4 text-center min-w-[80px]">
                <div className="text-xl sm:text-2xl font-bold text-foreground leading-none">{totalKeys}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Total keys</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-3 sm:p-4 text-center min-w-[80px]">
                <div className="text-xl sm:text-2xl font-bold text-foreground leading-none">
                  {configuredCount}
                  <span className="text-sm font-normal text-muted-foreground">/6</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {purpose === "pdf" ? "PDF" : "Text"} providers
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar (Purpose selection & quick settings trigger) */}
          <ApiConfigSidebar
            purpose={purpose}
            activeProvider={provider}
            totalPdfKeys={totalPdfKeys}
            totalTextKeys={totalTextKeys}
            onSelectPurpose={setConfigSubTab}
            onSelectProvider={(p) => setActiveProvider((prev) => ({ ...prev, [purpose]: p }))}
            onOpenSettings={openSettingsModal}
            aiState={aiState}
          />

          {/* Main Area: Stored Keys Table */}
          <div className="flex-1 min-w-0">
            <StoredKeysTable
              purpose={purpose}
              aiState={aiState}
              activeProvider={provider}
              actionLoading={actionLoading}
              onSelectProvider={(p) => setActiveProvider((prev) => ({ ...prev, [purpose]: p }))}
              onOpenSettings={openSettingsModal}
              onTestStoredKey={handleTestStoredKey}
              onDeleteStoredKey={handleDeleteStoredKey}
            />
          </div>
        </div>
      </MainLandmark>

      {/* Add New LLM Modal */}
      <AddNewLlmModal
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
        initialPurpose={purpose}
        initialProvider={provider}
        initialStep={modalInitialStep}
        aiState={aiState}
        configLoading={configLoading}
        onSaveLlm={handleSaveLlm}
        onTestInlineKey={handleTestInlineKey}
        totalPdfKeys={totalPdfKeys}
        totalTextKeys={totalTextKeys}
      />

      {/* Confirmation & Alert Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        loading={Boolean(actionLoading)}
        actions={
          pendingKeyDelete ? (
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={closeModal} disabled={Boolean(actionLoading)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDeleteKey}
                disabled={Boolean(actionLoading)}
              >
                {actionLoading ? "Deleting..." : "Delete Key"}
              </Button>
            </div>
          ) : undefined
        }
      />
    </div>
  );
}
