"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/cn.js";
import { card, page, pageInner } from "@/lib/ui.js";
import {
  FaServer,
  FaDatabase,
  FaMemory,
  FaCloudDownloadAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSyncAlt,
  FaTerminal,
  FaShieldAlt,
  FaCogs,
  FaNetworkWired,
  FaMicrochip,
} from "react-icons/fa";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import PageLoader from "@/components/ui/PageLoader.jsx";
import { Button, StatusBadge } from "@/components/ui/index.js";
import apiClient from "@/lib/apiClient.js";
import SuperAdminNavTabs from "./components/SuperAdminNavTabs.jsx";
import SystemDiagnosticsModal from "./components/SystemDiagnosticsModal.jsx";

export default function SuperAdminSystem() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await apiClient.get("/health");
      setHealthData(res.data);
    } catch (err) {
      setHealthData({
        status: "degraded",
        timestamp: new Date().toISOString(),
        version: "2.1.0",
        checks: {
          database: false,
          redis: "disabled",
          storage: "disabled",
          asyncJobs: "disabled",
        },
        error: err.message || "Failed to reach health endpoint",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHealth();
  };

  if (loading && !healthData) {
    return <PageLoader message="Probing infrastructure health..." />;
  }

  const isHealthy = healthData?.status === "ok";
  const checks = healthData?.checks || {};

  const services = [
    {
      id: "database",
      name: "PostgreSQL Database",
      subtitle: "Relational persistence & pgvector store",
      icon: FaDatabase,
      status: checks.database === true ? "healthy" : "unhealthy",
      statusLabel: checks.database === true ? "Connected & Healthy" : "Connection Failed",
      details: checks.database === true
        ? "Active connection pool with Drizzle ORM. Ready for queries."
        : "Database ping failed. Check DATABASE_URL and network reachability.",
    },
    {
      id: "redis",
      name: "Redis Memory Cache",
      subtitle: "Rate-limiting & queue state store",
      icon: FaMemory,
      status: checks.redis === true ? "healthy" : checks.redis === "disabled" ? "warning" : "unhealthy",
      statusLabel:
        checks.redis === true
          ? "Connected (Distributed Cache)"
          : checks.redis === "disabled"
          ? "In-Memory Fallback (Single Node)"
          : "Connection Failed",
      details:
        checks.redis === true
          ? "Active Redis client handling distributed rate limits and job queues."
          : checks.redis === "disabled"
          ? "REDIS_URL not configured. Utilizing local in-memory store for rate-limits."
          : "Redis client error. Check REDIS_URL and server status.",
    },
    {
      id: "asyncJobs",
      name: "BullMQ Background Workers",
      subtitle: "Asynchronous assessment generation",
      icon: FaCogs,
      status: checks.asyncJobs === "enabled" ? "healthy" : "neutral",
      statusLabel: checks.asyncJobs === "enabled" ? "Background Queue Active" : "Synchronous Execution",
      details:
        checks.asyncJobs === "enabled"
          ? "BullMQ worker processing generation jobs asynchronously via Redis."
          : "USE_ASYNC_JOBS disabled. Assessment questions generate synchronously per attempt.",
    },
    {
      id: "storage",
      name: "Object Storage Engine",
      subtitle: "Document artifacts & resource storage",
      icon: FaCloudDownloadAlt,
      status: checks.storage === "configured" ? "healthy" : "neutral",
      statusLabel: checks.storage === "configured" ? "S3 / MinIO Active" : "Local Scaffold",
      details:
        checks.storage === "configured"
          ? "S3-compatible bucket attached for resource files and generated exports."
          : "S3_ENDPOINT unset. System operating with local document processing scaffold.",
    },
  ];

  return (
    <div className={page}>
      <AmbientBackground />

      <MainLandmark className={pageInner}>
        <SuperAdminNavTabs />

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
            Infrastructure & Diagnostics
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight text-balance">
                  System Health & Diagnostics
                </h1>
                <StatusBadge
                  variant={isHealthy ? "success" : "danger"}
                  size="md"
                  label={isHealthy ? "Operational" : "Degraded"}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1 text-pretty">
                Live backend health probes, infrastructure service status, and environment diagnostics.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                <FaSyncAlt className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
                {refreshing ? "Probing..." : "Refresh Status"}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowDiagnosticsModal(true)}
                className="gap-2"
              >
                <FaTerminal className="w-3.5 h-3.5" />
                Raw Diagnostics
              </Button>
            </div>
          </div>
        </div>

        {/* Overall System Banner */}
        <div
          className={cn(
            "p-5 rounded-2xl border mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
            isHealthy
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
              : "bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-300"
          )}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span
              className={cn(
                "p-3 rounded-xl flex items-center justify-center shrink-0",
                isHealthy
                  ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                  : "bg-red-500/20 text-red-700 dark:text-red-400"
              )}
            >
              {isHealthy ? (
                <FaCheckCircle className="w-5 h-5" />
              ) : (
                <FaExclamationTriangle className="w-5 h-5" />
              )}
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-foreground">
                {isHealthy
                  ? "All Core Subsystems Operational"
                  : "Degraded System State Detected"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Last probe executed at{" "}
                <span className="font-mono text-foreground">
                  {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : "N/A"}
                </span>{" "}
                (Probe Version: v{healthData?.version || "2.1.0"})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-xs px-2.5 py-1 rounded-full bg-input border border-border text-foreground font-mono">
              Fastify 5 + Node 24 ESM
            </span>
          </div>
        </div>

        {/* Core Services Grid */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <FaServer className="w-4 h-4 text-indigo-500" />
            Infrastructure Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((svc) => {
              const Icon = svc.icon;
              const isOk = svc.status === "healthy";
              const isWarn = svc.status === "warning";

              return (
                <div
                  key={svc.id}
                  className={cn(card, "@container p-5 flex flex-col justify-between relative overflow-hidden")}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 rounded-xl bg-input border border-border text-foreground shrink-0">
                        <Icon className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{svc.name}</h3>
                        <p className="text-xs text-muted-foreground">{svc.subtitle}</p>
                      </div>
                    </div>

                    <StatusBadge
                      variant={isOk ? "success" : isWarn ? "warning" : svc.status === "unhealthy" ? "danger" : "neutral"}
                      size="sm"
                      label={svc.statusLabel}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {svc.details}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & Environment Audits */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <FaShieldAlt className="w-4 h-4 text-indigo-500" />
            Security & Runtime Configuration
          </h2>

          <div className={cn(card, "p-5 sm:p-6")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-input border border-border">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
                  <FaShieldAlt className="w-3.5 h-3.5 text-emerald-500" />
                  API Key Encryption
                </div>
                <div className="text-sm font-bold text-foreground">
                  AES-256 Vault Active
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Provider keys encrypted at rest
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-input border border-border">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
                  <FaNetworkWired className="w-3.5 h-3.5 text-indigo-500" />
                  Cookie Session Guard
                </div>
                <div className="text-sm font-bold text-foreground">
                  httpOnly + SameSite
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  gradewise_token with Fastify JWT
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-input border border-border">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
                  <FaMicrochip className="w-3.5 h-3.5 text-violet-500" />
                  AI SDK Multi-Provider
                </div>
                <div className="text-sm font-bold text-foreground">
                  Vercel AI SDK 7
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Dynamic key rotation & load balancing
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-input border border-border">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
                  <FaTerminal className="w-3.5 h-3.5 text-amber-500" />
                  Process Orchestration
                </div>
                <div className="text-sm font-bold text-foreground">
                  PM2 Ecosystem
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  API & Worker instances running
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostics Modal */}
        <SystemDiagnosticsModal
          isOpen={showDiagnosticsModal}
          onClose={() => setShowDiagnosticsModal(false)}
          healthData={healthData}
        />
      </MainLandmark>
    </div>
  );
}
