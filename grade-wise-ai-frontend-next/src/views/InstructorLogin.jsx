import { cn } from "@/lib/cn.js";
import { card } from "@/lib/ui.js";
import Modal from "../components/ui/Modal.jsx";
import AuthPageLayout from "../components/layout/AuthPageLayout.jsx";
import LoginFormFields, { LoginSubmitButton } from "../components/auth/LoginFormFields.jsx";
import useLoginForm from "../hooks/useLoginForm.js";
import { FaSignInAlt, FaChalkboardTeacher } from "react-icons/fa";

function InstructorLogin() {
  const { form, loading, modal, closeModal, handleLogin } = useLoginForm({
    allowedRoles: ["instructor"],
    onAccessDenied: () => "Unauthorized: This portal is strictly for Instructors only.",
    successTitle: "Instructor Access Granted",
    successMessage: (name) => `Welcome back, Instructor ${name}!`,
  });

  const { register, formState: { errors } } = form;

  return (
    <AuthPageLayout>
      <div className={cn("w-full", card, "p-8", "shadow-2xl")}>
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-5">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
              <FaChalkboardTeacher className="text-2xl text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Instructor Portal</h1>
          <p className={cn("text-muted-foreground", "text-sm")}>
            Sign in to your{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent font-semibold">
              Gradewise AI
            </span>{" "}
            educator account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <LoginFormFields
            register={register}
            errors={errors}
            emailLabel="Instructor Email"
            passwordLabel="Portal Password"
            emailPlaceholder="instructor@gradewise.ai"
            passwordPlaceholder="••••••••••••"
          />
          <LoginSubmitButton loading={loading} label="Enter Portal" icon={FaSignInAlt} />
        </form>

        <div className="mt-7 pt-6 border-t border-border text-center">
          <p className={cn("text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-widest")}>
            Academic Portal &bull; Secure Access
          </p>
        </div>
      </div>

      <p className={cn("mt-6", "text-center", "text-muted-foreground", "text-xs")}>
        Gradewise AI Educator Network &copy; 2026
      </p>

      <Modal isOpen={modal.isOpen} onClose={closeModal} type={modal.type} title={modal.title}>
        <div className={"text-secondary-foreground"}>{modal.message}</div>
      </Modal>
    </AuthPageLayout>
  );
}

export default InstructorLogin;
