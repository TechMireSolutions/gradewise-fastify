"use client";

import { cn } from "@/lib/cn.js";
import { card as uiCard, iconBadge, page } from "@/lib/ui.js";
import Link from "next/link";
import { Modal, Button } from "@/components/ui";
import { FaKey, FaArrowLeft, FaWrench } from "react-icons/fa";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import useSuperAdminApiConfig, { providerLabels } from "./hooks/useSuperAdminApiConfig.js";
import ApiConfigSidebar from "./components/ApiConfigSidebar.jsx";
import ModelSelector from "./components/ModelSelector.jsx";
import AddKeysSection from "./components/AddKeysSection.jsx";
import StoredKeysTable from "./components/StoredKeysTable.jsx";

export default function SuperAdminApiConfig() {
  const {
    aiState,
    setConfigSubTab,
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
    modal,
    closeModal,
    updateActiveCard,
    handleSaveCard,
    handleTestStoredKey,
    handleDeleteStoredKey,
    confirmDeleteKey,
    handleTestInlineKey,
  } = useSuperAdminApiConfig();

  return (
    <div className={page}>
      <AmbientBackground />

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            href="/super-admin/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium mb-6 transition-colors duration-150 group"
          >
            <FaArrowLeft className="w-3 h-3 transition-transform duration-150 group-hover:-translate-x-0.5" />
            Back to Dashboard
          </Link>

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
          {/* Sidebar */}
          <ApiConfigSidebar
            purpose={purpose}
            activeProvider={provider}
            aiState={aiState}
            totalPdfKeys={totalPdfKeys}
            totalTextKeys={totalTextKeys}
            onSelectPurpose={setConfigSubTab}
            onSelectProvider={(p) => setActiveProvider((prev) => ({ ...prev, [purpose]: p }))}
          />

          {/* Main Configuration Panels */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* Active Provider Card */}
            <div className={cn(uiCard, "shadow-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-200")}>
              {/* Card Header */}
              <div className="px-6 py-4 border-b border-border bg-input flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={cn("p-2 rounded-lg text-white", pStyle.accentBg)}>
                    <FaWrench className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {providerLabels[provider]} Settings
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {purpose === "pdf" ? "PDF Extraction" : "Question Generation & Evaluation"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", pStyle.badge)}>
                    {card.list.length} key{card.list.length !== 1 ? "s" : ""} in pool
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Model Selector */}
                <ModelSelector
                  provider={provider}
                  model={card.model}
                  onChangeModel={(val) => updateActiveCard("model", val)}
                  disabled={configLoading}
                />

                {/* Add Keys Section */}
                <div className="pt-4 border-t border-border">
                  <AddKeysSection
                    provider={provider}
                    purpose={purpose}
                    card={card}
                    pStyle={pStyle}
                    configLoading={configLoading}
                    inlineTestStatus={inlineTestStatus}
                    onUpdateCard={updateActiveCard}
                    onTestInlineKey={handleTestInlineKey}
                    onSaveCard={handleSaveCard}
                  />
                </div>
              </div>
            </div>

            {/* Stored Keys Table */}
            <StoredKeysTable
              provider={provider}
              purpose={purpose}
              card={card}
              pStyle={pStyle}
              actionLoading={actionLoading}
              onTestStoredKey={handleTestStoredKey}
              onDeleteStoredKey={handleDeleteStoredKey}
            />
          </main>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        actions={
          pendingKeyDelete ? (
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDeleteKey}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Key
              </Button>
            </div>
          ) : undefined
        }
      />
    </div>
  );
}
