import {
  FaUsers,
  FaCrown,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaCheckCircle,
} from "react-icons/fa";
import { DashboardStatCard, DashboardStatGrid } from "@/components/dashboard/shared/index.js";

export default function AdminStatsSection({ stats, totalUsers, loading = false }) {
  const cards = [
    { value: totalUsers, label: "Total Users", icon: FaUsers, tone: "indigo" },
    { value: stats?.admin ?? 0, label: "Admins", icon: FaCrown, tone: "rose" },
    { value: stats?.instructor ?? 0, label: "Instructors", icon: FaChalkboardTeacher, tone: "purple" },
    { value: stats?.student ?? 0, label: "Students", icon: FaUserGraduate, tone: "emerald" },
    { value: stats?.verified ?? 0, label: "Verified", icon: FaCheckCircle, tone: "sky" },
  ];

  return (
    <DashboardStatGrid columns={5}>
      {cards.map(({ value, label, icon, tone }) => (
        <DashboardStatCard
          key={label}
          label={label}
          value={value}
          icon={icon}
          tone={tone}
          loading={loading}
        />
      ))}
    </DashboardStatGrid>
  );
}
