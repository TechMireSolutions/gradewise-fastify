import {
  FaPen,
  FaBook,
  FaSchool,
  FaUserGraduate,
  FaChartLine,
} from "react-icons/fa";
import {
  DashboardSectionCard,
  DashboardQuickActions,
} from "@/components/dashboard/shared/index.js";

const quickActionsData = [
  {
    title: "Create Assessment",
    description: "Build questions with AI generation rules",
    icon: FaPen,
    link: "/instructor/assessments/create",
    gradient: "from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500",
  },
  {
    title: "Manage Resources",
    description: "Upload PDFs, docs, links & learning materials",
    icon: FaBook,
    link: "/instructor/resources",
    gradient: "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
  },
  {
    title: "My Assessments",
    description: "View, edit, enroll & export papers",
    icon: FaSchool,
    link: "/instructor/assessments",
    gradient: "from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500",
  },
  {
    title: "Add New Student",
    description: "Register students and manage cohorts",
    icon: FaUserGraduate,
    link: "/instructor/students",
    gradient: "from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500",
  },
  {
    title: "View Analytics",
    description: "Track student performance & scores",
    icon: FaChartLine,
    link: "/instructor/assessments/analytics",
    gradient: "from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500",
  },
];

export default function InstructorQuickActions() {
  return (
    <DashboardSectionCard
      title="Quick Actions"
      icon={FaSchool}
    >
      <DashboardQuickActions actions={quickActionsData} columns={5} />
    </DashboardSectionCard>
  );
}
