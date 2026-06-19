import { cn } from "@/lib/cn.js";
import { card, cardHeader, cardInteractive, page } from "@/lib/ui.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAssessmentStore from "@/features/assessments/store.js";
import useAuthStore from "@/features/auth/store.js";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Modal from "../../components/ui/Modal";
import AmbientBackground from "../../components/layout/AmbientBackground.jsx";
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaArrowLeft, FaUserGraduate, FaUserShield } from "react-icons/fa";
import {
  registerStudentSchema,
  enrollStudentSchema,
} from "../../schemas/studentSchemas.js";
import useModal from "../../hooks/useModal.js";
import { parseZodFieldErrors } from "../../utils/parseZodFieldErrors.js";


function AddUser({ assessmentId, onStudentAdded, compact = false }) {
  const navigate = useNavigate();
  const { enrollStudent, loading: enrollLoading } = useAssessmentStore();
  const { registerStudent, user: currentUser } = useAuthStore();

  const [mode, setMode] = useState(assessmentId ? "enroll" : "register");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [isLoading, setIsLoading] = useState(false);
  const { modal, showModal: openModal, closeModal } = useModal();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const showModal = (type, title, message, redirect = false) => {
    openModal(type, title, message);

    if (type === "success" && redirect) {
      setTimeout(() => {
        closeModal();
        if (currentUser?.role === 'super_admin') {
          navigate("/super-admin/dashboard");
        } else if (currentUser?.role === 'admin') {
          navigate("/admin/dashboard");
        } else {
          navigate("/instructor/dashboard");
        }
      }, 1500);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      registerStudentSchema.parse(formData);
    } catch (err) {
      const fieldErrors = parseZodFieldErrors(err);
      showModal(
        "error",
        "Invalid Input",
        fieldErrors ? Object.values(fieldErrors)[0] : "Invalid form data"
      );
      return;
    }

    setIsLoading(true);
    try {
      await registerStudent({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      if (assessmentId) {
        await enrollStudent(assessmentId, formData.email.trim());
        onStudentAdded?.();
        resetForm();
        showModal("success", "Success", "User registered and enrolled successfully!");
      } else {
        resetForm();
        showModal("success", "Success", "User registered successfully!", true);
      }
    } catch (err) {
      showModal("error", "Error", err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      enrollStudentSchema.parse({ email: formData.email });
    } catch (err) {
      const fieldErrors = parseZodFieldErrors(err);
      showModal(
        "error",
        "Invalid Input",
        fieldErrors ? Object.values(fieldErrors)[0] : "Invalid email"
      );
      return;
    }

    try {
      await enrollStudent(assessmentId, formData.email.trim());
      showModal("success", "Success", "User enrolled successfully!");
      setFormData((prev) => ({ ...prev, email: "" }));
      onStudentAdded?.();
    } catch (err) {
      showModal("error", "Error", err.message || "Enrollment failed");
    }
  };

  const inputClass =
    "w-full bg-input backdrop-blur-sm border border-border hover:border-accent/40 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-secondary-foreground placeholder:text-subtle-foreground text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";
  const labelClass = "block text-muted-foreground text-sm font-medium mb-1.5";

  const formContent = mode === "register" ? (
    <form onSubmit={handleRegister} className={compact ? "space-y-4" : "space-y-5"}>
      <div>
        <label className={labelClass}>Full Name</label>
        <div className="relative">
          <FaUser className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-muted-foreground", "text-sm", "pointer-events-none")} />
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="John Doe"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Email</label>
        <div className="relative">
          <FaEnvelope className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-muted-foreground", "text-sm", "pointer-events-none")} />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="user@example.com"
          />
        </div>
      </div>

      {!assessmentId && (
        <div>
          <label className={labelClass}>User Role</label>
          <div className="relative">
            <FaUserShield className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-muted-foreground", "text-sm", "pointer-events-none")} />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="student" className={cn("bg-slate-800", "text-secondary-foreground")}>Student</option>
              <option value="instructor" className={cn("bg-slate-800", "text-secondary-foreground")}>Instructor</option>
              <option value="admin" className={cn("bg-slate-800", "text-secondary-foreground")}>Admin</option>
            </select>
          </div>
        </div>
      )}

      <div>
        <label className={labelClass}>Password</label>
        <div className="relative">
          <FaLock className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-muted-foreground", "text-sm", "pointer-events-none")} />
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="Min. 6 characters"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Confirm Password</label>
        <div className="relative">
          <FaLock className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-muted-foreground", "text-sm", "pointer-events-none")} />
          <input
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="Confirm password"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={cn("inline-flex", "items-center", "justify-center", "gap-2", "px-5", "py-3", "bg-btn-secondary", "hover:bg-surface-elevated", "border", "border-border", "text-secondary-foreground", "hover:text-foreground", "rounded-xl", "font-medium", "text-sm", "transition-all", "duration-200", "active:scale-95", "cursor-pointer")}
        >
          <FaArrowLeft />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" color="white" type="dots" />
              <span>Registering...</span>
            </>
          ) : (
            <>
              <FaUserPlus />
              <span>Register User</span>
            </>
          )}
        </button>
      </div>
    </form>
  ) : (
    <form onSubmit={handleEnroll} className={compact ? "space-y-4" : "space-y-5"}>
      <div>
        <label className={labelClass}>User Email</label>
        <div className="relative">
          <FaEnvelope className={cn("absolute", "left-4", "top-1/2", "-translate-y-1/2", "text-muted-foreground", "text-sm", "pointer-events-none")} />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="user@example.com"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={cn("inline-flex", "items-center", "justify-center", "gap-2", "px-5", "py-3", "bg-btn-secondary", "hover:bg-surface-elevated", "border", "border-border", "text-secondary-foreground", "hover:text-foreground", "rounded-xl", "font-medium", "text-sm", "transition-all", "duration-200", "active:scale-95", "cursor-pointer")}
        >
          <FaArrowLeft />
          Cancel
        </button>
        <button
          type="submit"
          disabled={enrollLoading}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {enrollLoading ? (
            <>
              <LoadingSpinner size="sm" color="white" type="dots" />
              <span>Enrolling...</span>
            </>
          ) : (
            <>
              <FaUserGraduate />
              <span>Enroll User</span>
            </>
          )}
        </button>
      </div>
    </form>
  );

  // Standalone page layout
  if (!compact) {
    return (
      <div className={page}>
        <AmbientBackground />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                <FaUserPlus className="text-white text-lg" />
              </div>
              <div>
                <p className={cn("text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-widest", "mb-1")}>User Management</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Add New User</h1>
              </div>
            </div>
            <p className={cn("text-muted-foreground", "leading-relaxed")}>
              Register a new user or enroll an existing one into an assessment.
            </p>
          </div>

          {/* Card */}
          <div className={cn(card, cardInteractive, "shadow-2xl")}>
            {/* Card header */}
            <div className={cardHeader}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">
                  {mode === "register" ? "Register User" : "Enroll Existing User"}
                </h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  mode === "register"
                    ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                }`}>
                  {mode === "register" ? (
                    <><FaUser className="text-xs" /> New User</>
                  ) : (
                    <><FaUserGraduate className="text-xs" /> Existing User</>
                  )}
                </span>
              </div>
            </div>

            {/* Card body */}
            <div className="p-6 sm:p-8">
              {formContent}
            </div>
          </div>
        </div>

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

  // Compact mode
  return (
    <>
      {assessmentId && (
        <div className="mb-4 -mt-2">
          <button
            onClick={() => setMode((m) => (m === "enroll" ? "register" : "enroll"))}
            className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors duration-150 cursor-pointer"
          >
            {mode === "enroll" ? "→ Register new user instead" : "→ Enroll existing instead"}
          </button>
        </div>
      )}
      {formContent}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
      >
        {modal.message}
      </Modal>
    </>
  );
}

export default AddUser;
