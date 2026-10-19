import {
  FaClipboardList,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import { DashboardStatCard, DashboardStatGrid } from "@/components/dashboard/shared/index.js";

export default function StudentStats({ stats, loading = false }) {
  const statsData = [
    {
      value: stats?.totalAssessments ?? 0,
      label: "Total Assessments",
      icon: FaClipboardList,
      tone: "indigo",
    },
    {
      value: stats?.completedAssessments ?? 0,
      label: "Completed",
      icon: FaCheckCircle,
      tone: "emerald",
    },
    {
      value: stats?.pendingAssessments ?? 0,
      label: "Pending",
      icon: FaClock,
      tone: "amber",
    },
  ];

  return (
    <DashboardStatGrid columns={3}>
      {statsData.map((stat) => (
        <DashboardStatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          tone={stat.tone}
          loading={loading}
        />
      ))}
    </DashboardStatGrid>
  );
}
