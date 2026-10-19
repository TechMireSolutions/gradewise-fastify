import {
  FaClipboardList,
  FaChartBar,
  FaUsers,
  FaBook,
} from "react-icons/fa";
import { DashboardStatCard, DashboardStatGrid } from "@/components/dashboard/shared/index.js";

export default function InstructorStats({ overview, loading = false }) {
  const statsData = [
    {
      value: overview?.assessments ?? 0,
      label: "Total Assessments",
      icon: FaClipboardList,
      tone: "indigo",
    },
    {
      value: overview?.executedAssessments ?? 0,
      label: "Executed Assessments",
      icon: FaChartBar,
      tone: "amber",
    },
    {
      value: overview?.totalStudents ?? 0,
      label: "Enrolled Students",
      icon: FaUsers,
      tone: "sky",
    },
    {
      value: overview?.resources ?? 0,
      label: "Resources Uploaded",
      icon: FaBook,
      tone: "emerald",
    },
  ];

  return (
    <DashboardStatGrid columns={4}>
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
