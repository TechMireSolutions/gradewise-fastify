"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn.js";
import { card, page, pageInner, focusRing } from "@/lib/ui.js";
import {
  FaCrown,
  FaShieldAlt,
  FaUsers,
  FaKey,
  FaChartBar,
  FaServer,
  FaUserPlus,
  FaArrowRight,
  FaCogs,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
} from "react-icons/fa";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import PageLoader from "@/components/ui/PageLoader.jsx";
import Modal from "@/components/ui/Modal.jsx";
import { Button, StatusBadge } from "@/components/ui/index.js";
import useUserManagement from "@/hooks/useUserManagement.js";
import useAdminStore from "@/features/admin/store.js";
import apiClient from "@/lib/apiClient.js";
import UserManagementTable from "@/components/admin/UserManagementTable.jsx";
import useSuperAdminApiConfig from "./hooks/useSuperAdminApiConfig.js";
import SuperAdminNavTabs from "./components/SuperAdminNavTabs.jsx";
import AddUserModal from "./components/AddUserModal.jsx";
import ChangeRoleModal from "./components/ChangeRoleModal.jsx";
import DeleteUserModal from "./components/DeleteUserModal.jsx";
import ProviderSettingsModal from "./components/ProviderSettingsModal.jsx";

export default function SuperAdminDashboard() {
  const {
    user,
    users,
    totalUsers,
    loading: usersLoading,
    actionLoading,
    modal,
    closeModal,
    fetchUsers,
    handleRoleChange,
    handleCreateUser,
    handleDeleteUser,
    confirmDeleteUser,
    activeModal,
    selectedUser,
    openCreateModal,
    openRoleModal,
    closeActiveModal,
  } = useUserManagement();

  const apiConfig = useSuperAdminApiConfig();
  const { overview, getAdminOverview } = useAdminStore();
  const [healthStatus, setHealthStatus] = useState("checking");

  useEffect(() => {
    fetchUsers({ limit: 5 });
    getAdminOverview().catch(() => {});
    apiClient
      .get("/health")
      .then((res) => setHealthStatus(res.data?.status === "ok" ? "ok" : "degraded"))
      .catch(() => setHealthStatus("degraded"));
  }, [fetchUsers, getAdminOverview]);

  if (usersLoading && users.length === 0) {
    return <PageLoader message="Loading Super Admin Command Center..." />;
  }

  const { assessments, attempts } = overview || {
    assessments: { total: 0, executed: 0 },
    attempts: { total: 0, completed: 0, averageScore: 0 },
  };

  const configuredKeyCount = apiConfig.configuredCount || 0;
  const recentUsers = users.slice(0, 5);

  return (
    <div className={page}>
      <AmbientBackground />

      <MainLandmark className={pageInner}>
        <SuperAdminNavTabs />

        {/* Executive Header Banner */}
        <div className="mb-8">
          <div className={cn(card, "@container p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-2xl")}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                    <FaCrown className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">
                    Super Administrator Authority
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight text-balance">
                  Executive Command Center
                </h1>

                <p className="text-sm sm:text-base text-secondary-foreground leading-relaxed mt-1 text-pretty">
                  Welcome back, <span className="text-foreground font-semibold">{user?.name}</span>. Full platform authority over user governance, AI engine configuration, system diagnostics, and assessment analytics.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <StatusBadge
                    variant={healthStatus === "ok" ? "success" : healthStatus === "checking" ? "info" : "danger"}
                    size="md"
                    label={
                      healthStatus === "ok"
                        ? "Infrastructure Operational"
                        : healthStatus === "checking"
                        ? "Probing Health..."
                        : "Subsystems Degraded"
                    }
                  />

                  <span className="text-xs text-muted-foreground flex items-center gap-1.5 bg-input px-3 py-1.5 rounded-xl border border-border">
                    <FaShieldAlt className="text-indigo-500 w-3 h-3" />
                    AES-256 Vault Active
                  </span>
                </div>
              </div>

              {/* Header Quick Action Popups */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
                <Button
                  variant="primary"
                  onClick={openCreateModal}
                  className="w-full justify-center gap-2"
                >
                  <FaUserPlus className="w-3.5 h-3.5" />
                  Add New User
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => apiConfig.openSettingsModal(null, 1)}
                  className="w-full justify-center gap-2"
                >
                  <FaPlus className="w-3.5 h-3.5" />
                  Add New LLM
                </Button>

                <Link
                  href="/super-admin/system"
                  className={cn(
                    "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-input hover:bg-btn-secondary text-secondary-foreground hover:text-foreground border border-border transition-all active:scale-95",
                    focusRing
                  )}
                >
                  <FaServer className="w-3 h-3 text-indigo-500" />
                  System Health
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Executive KPI Summary Highlights (Links to Sub-pages) */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Platform Health & Metric Highlights
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Users */}
            <Link
              href="/super-admin/users"
              className={cn(
                card,
                "p-5 hover:border-indigo-500/40 hover:bg-surface-elevated transition-all duration-200 group flex flex-col justify-between"
              )}
            >
              <div>
                <div className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="text-xs font-medium">Total Registered Users</span>
                  <FaUsers className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-3xl font-extrabold text-foreground">
                  {totalUsers}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Global accounts across all 4 roles
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-medium text-indigo-600 dark:text-indigo-400">
                <span>Manage Users & RBAC</span>
                <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Metric 2: AI Config */}
            <Link
              href="/super-admin/api-config"
              className={cn(
                card,
                "p-5 hover:border-violet-500/40 hover:bg-surface-elevated transition-all duration-200 group flex flex-col justify-between"
              )}
            >
              <div>
                <div className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="text-xs font-medium">Configured AI Providers</span>
                  <FaKey className="w-4 h-4 text-violet-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-3xl font-extrabold text-foreground">
                  {configuredKeyCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active keys for PDF & Text AI engines
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-medium text-violet-600 dark:text-violet-400">
                <span>Open Key Vault</span>
                <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Metric 3: Assessment Analytics */}
            <Link
              href="/super-admin/analytics"
              className={cn(
                card,
                "p-5 hover:border-emerald-500/40 hover:bg-surface-elevated transition-all duration-200 group flex flex-col justify-between"
              )}
            >
              <div>
                <div className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="text-xs font-medium">Total Assessments</span>
                  <FaChartBar className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-3xl font-extrabold text-foreground">
                  {assessments.total}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {attempts.total} attempts submitted ({attempts.completed} completed)
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span>View Full Telemetry</span>
                <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Metric 4: System Health */}
            <Link
              href="/super-admin/system"
              className={cn(
                card,
                "p-5 hover:border-amber-500/40 hover:bg-surface-elevated transition-all duration-200 group flex flex-col justify-between"
              )}
            >
              <div>
                <div className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="text-xs font-medium">Infrastructure State</span>
                  <FaServer className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-extrabold text-foreground flex items-center gap-2">
                  {healthStatus === "ok" ? (
                    <>
                      <FaCheckCircle className="w-5 h-5 text-emerald-500" />
                      Healthy
                    </>
                  ) : (
                    <>
                      <FaExclamationTriangle className="w-5 h-5 text-amber-500" />
                      Degraded
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  PostgreSQL, Redis & BullMQ Workers
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-medium text-amber-600 dark:text-amber-400">
                <span>Diagnostics & Probes</span>
                <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Dedicated Workspace Launchers */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <FaCogs className="w-4 h-4 text-indigo-500" />
            Dedicated Administrative Portals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Workspace 1 */}
            <div className={cn(card, "p-6 flex flex-col justify-between")}>
              <div className="flex items-start gap-4">
                <span className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shrink-0">
                  <FaUsers className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    User Directory & Role Governance
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Search and filter users across Super Admin, Admin, Instructor, and Student tiers. Invite new accounts and change user roles via modal dialogs.
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">
                  {totalUsers} registered users
                </span>
                <Link
                  href="/super-admin/users"
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all",
                    focusRing
                  )}
                >
                  Open Users Page
                  <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Workspace 2 */}
            <div className={cn(card, "p-6 flex flex-col justify-between")}>
              <div className="flex items-start gap-4">
                <span className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shrink-0">
                  <FaKey className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    AI Engine & Key Management Vault
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Manage multi-provider API keys for Gemini, OpenAI, Claude, Groq, Mistral, and DeepSeek. Configure model tiers for PDF parsing and text generation.
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">
                  {configuredKeyCount} active providers
                </span>
                <Link
                  href="/super-admin/api-config"
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-btn-secondary hover:bg-surface-elevated text-secondary-foreground hover:text-foreground border border-border transition-all",
                    focusRing
                  )}
                >
                  Open AI Vault
                  <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Workspace 3 */}
            <div className={cn(card, "p-6 flex flex-col justify-between")}>
              <div className="flex items-start gap-4">
                <span className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shrink-0">
                  <FaChartBar className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Platform & Assessment Analytics
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    System-wide assessment completion metrics, student attempt score averages, role distributions, and verification audits.
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">
                  {assessments.total} assessments tracked
                </span>
                <Link
                  href="/super-admin/analytics"
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-btn-secondary hover:bg-surface-elevated text-secondary-foreground hover:text-foreground border border-border transition-all",
                    focusRing
                  )}
                >
                  View Analytics
                  <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Workspace 4 */}
            <div className={cn(card, "p-6 flex flex-col justify-between")}>
              <div className="flex items-start gap-4">
                <span className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shrink-0">
                  <FaServer className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Infrastructure & System Diagnostics
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Inspect PostgreSQL database ping, Redis caching state, BullMQ background worker queue, and export raw diagnostic JSON dumps.
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">
                  Status: {healthStatus === "ok" ? "All Operational" : "Degraded"}
                </span>
                <Link
                  href="/super-admin/system"
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-btn-secondary hover:bg-surface-elevated text-secondary-foreground hover:text-foreground border border-border transition-all",
                    focusRing
                  )}
                >
                  Run Diagnostics
                  <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users Preview Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <FaUsers className="w-4 h-4 text-indigo-500" />
                Recent User Accounts
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Quick preview of latest registered accounts. Navigate to Users page for complete directory and search.
              </p>
            </div>

            <Link
              href="/super-admin/users"
              className={cn(
                "inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline self-start sm:self-auto",
                focusRing
              )}
            >
              View Full User Directory ({totalUsers})
              <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className={cn(card, "@container p-0 overflow-hidden")}>
            <UserManagementTable
              users={recentUsers}
              compact
              currentUserId={user?.id}
              actionLoading={actionLoading}
              onOpenRoleModal={openRoleModal}
              onDelete={handleDeleteUser}
              canDelete
            />

            <div className="p-3 bg-input/20 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Showing {recentUsers.length} of {totalUsers} total users
              </span>
              <Link
                href="/super-admin/users"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Go to Users &rarr;
              </Link>
            </div>
          </div>
        </div>
      </MainLandmark>

      {/* ─── Popup Modal Forms (Pure Dialogs) ────────────────────────────────── */}

      {/* 1. Add User Popup Form */}
      <AddUserModal
        isOpen={activeModal === "create"}
        onClose={closeActiveModal}
        onSubmit={handleCreateUser}
        loading={actionLoading === "create-user"}
      />

      {/* 2. Change Role Popup Form */}
      <ChangeRoleModal
        isOpen={activeModal === "change-role"}
        onClose={closeActiveModal}
        user={selectedUser}
        onRoleChange={handleRoleChange}
        loading={Boolean(actionLoading?.startsWith("role-"))}
      />

      {/* 3. Delete Confirmation Popup Modal */}
      <DeleteUserModal
        isOpen={activeModal === "delete"}
        onClose={closeActiveModal}
        user={selectedUser}
        onConfirm={confirmDeleteUser}
        loading={Boolean(actionLoading?.startsWith("delete-"))}
      />

      {/* 4. Quick AI Key Configuration / Add New LLM Modal */}
      <ProviderSettingsModal
        isOpen={apiConfig.isSettingsModalOpen}
        onClose={apiConfig.closeSettingsModal}
        purpose={apiConfig.purpose}
        provider={apiConfig.provider}
        initialStep={apiConfig.modalInitialStep}
        card={apiConfig.card}
        pStyle={apiConfig.pStyle}
        aiState={apiConfig.aiState}
        configLoading={apiConfig.configLoading}
        inlineTestStatus={apiConfig.inlineTestStatus}
        onChangeProvider={(p) =>
          apiConfig.setActiveProvider((prev) => ({ ...prev, [apiConfig.purpose]: p }))
        }
        onUpdateCard={apiConfig.updateActiveCard}
        onTestInlineKey={apiConfig.handleTestInlineKey}
        onSaveCard={apiConfig.handleSaveCard}
        onSaveLlm={apiConfig.handleSaveLlm}
        totalPdfKeys={apiConfig.totalPdfKeys}
        totalTextKeys={apiConfig.totalTextKeys}
      />

      {/* 5. General Notification Alert Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
      >
        {modal.message}
      </Modal>
    </div>
  );
}
