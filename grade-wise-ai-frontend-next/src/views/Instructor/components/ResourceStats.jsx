import { FaBook, FaFilePdf, FaFolder } from "react-icons/fa";
import {
  DashboardStatCard,
  DashboardStatGrid,
} from "@/components/dashboard/shared/index.js";

export default function ResourceStats({ resources = [], loading = false }) {
  const pdfCount = resources.filter((r) =>
    (r.fileType || r.contentType)?.toLowerCase().includes("pdf")
  ).length;

  const otherCount = Math.max(0, resources.length - pdfCount);

  return (
    <DashboardStatGrid columns={3}>
      <DashboardStatCard
        label="Total Resources"
        value={resources.length}
        icon={FaBook}
        tone="indigo"
        loading={loading}
      />
      <DashboardStatCard
        label="PDF Documents"
        value={pdfCount}
        icon={FaFilePdf}
        tone="emerald"
        loading={loading}
      />
      <DashboardStatCard
        label="Other Documents & Files"
        value={otherCount}
        icon={FaFolder}
        tone="amber"
        loading={loading}
      />
    </DashboardStatGrid>
  );
}
