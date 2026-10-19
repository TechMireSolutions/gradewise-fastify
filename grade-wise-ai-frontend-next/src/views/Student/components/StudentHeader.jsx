import { FaGraduationCap } from "react-icons/fa";
import WelcomeBanner from "@/components/layout/WelcomeBanner.jsx";

export default function StudentHeader({ userName }) {
  return (
    <WelcomeBanner
      eyebrow="Student Portal"
      title={`Welcome back, ${userName || "Student"}!`}
      description="Your personalized learning dashboard — track progress, complete assessments, and achieve excellence."
      icon={FaGraduationCap}
    />
  );
}
