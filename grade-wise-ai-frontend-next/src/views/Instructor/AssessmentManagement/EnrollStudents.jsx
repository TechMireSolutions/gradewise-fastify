"use client";

import { cn } from "@/lib/cn.js";
import { card, cardHeader, iconBadge, page, pageInner } from "@/lib/ui.js";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Modal } from "@/components/ui";
import AddStudent from "@/views/Instructor/AddStudent.jsx";
import { FaUserGraduate, FaUsers, FaArrowLeft } from "react-icons/fa";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import useEnrollStudents from "./hooks/useEnrollStudents.js";
import EnrolledRosterTable from "./components/EnrolledRosterTable.jsx";

export default function EnrollStudents() {
  const params = useParams();
  const assessmentId = params?.id;

  const {
    enrolledStudents,
    filteredStudents,
    loading,
    searchTerm,
    setSearchTerm,
    isUnenrolling,
    unenrollConfirm,
    requestUnenroll,
    cancelUnenroll,
    handleUnenrollConfirm,
    handleStudentAdded,
    modal,
    closeModal,
  } = useEnrollStudents(assessmentId);

  return (
    <div className={page}>
      <AmbientBackground />

      <MainLandmark className={pageInner}>
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn("p-2.5 rounded-xl", iconBadge)}>
              <FaUsers className="text-white text-lg" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
                Assessment Management
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight text-balance">
                Enroll Students
              </h1>
              <p className="text-muted-foreground text-sm mt-1 text-pretty">
                Register new student accounts or enroll existing students into this assessment
              </p>
            </div>
          </div>

          <Link
            href="/instructor/assessments"
            className="inline-flex items-center gap-2 px-4 py-2 bg-btn-secondary hover:bg-surface-elevated border border-border text-secondary-foreground hover:text-foreground rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <FaArrowLeft className="text-xs" aria-hidden="true" />
            <span>Back to Assessments</span>
          </Link>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Add Student Form */}
          <div className={cn(card, "shadow-xl h-fit overflow-hidden")}>
            <div className={cardHeader}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/25">
                  <FaUserGraduate className="text-white text-sm" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-foreground text-balance">Enroll Student</h2>
              </div>
            </div>
            <div className="p-6">
              <AddStudent compact assessmentId={assessmentId} onStudentAdded={handleStudentAdded} />
            </div>
          </div>

          {/* Right: Enrolled Students Roster */}
          <EnrolledRosterTable
            students={filteredStudents}
            totalCount={enrolledStudents?.length || 0}
            loading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRequestUnenroll={requestUnenroll}
          />
        </div>
      </MainLandmark>

      {/* Unenroll Confirmation Modal */}
      <Modal
        isOpen={unenrollConfirm.isOpen}
        onClose={cancelUnenroll}
        title="Unenroll Student"
        type="warning"
        message={`Are you sure you want to remove "${unenrollConfirm.name}" from this assessment? Their attempt history for this assessment will be unlinked.`}
        actions={
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={cancelUnenroll} disabled={isUnenrolling}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleUnenrollConfirm}
              disabled={isUnenrolling}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isUnenrolling ? "Removing..." : "Unenroll Student"}
            </Button>
          </div>
        }
      />

      {/* General Feedback Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
}
