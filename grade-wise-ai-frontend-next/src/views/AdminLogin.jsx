import { cn } from "@/lib/cn.js";
import { card } from "@/lib/ui.js";
import Modal from "../components/ui/Modal.jsx";
import AuthPageLayout from "../components/layout/AuthPageLayout.jsx";
import LoginFormFields, { LoginSubmitButton, AuthCardHeader } from "../components/auth/LoginFormFields.jsx";
import useLoginForm from "../hooks/useLoginForm.js";
import { FaSignInAlt, FaUserShield } from "react-icons/fa";

function AdminLogin() {
  const { form, loading, modal, closeModal, handleLogin } = useLoginForm({
    allowedRoles: ["admin", "super_admin"],
    onAccessDenied: () => "Unauthorized: This portal is strictly for Administrators only.",
    successTitle: "Admin Access Granted",
    successMessage: (name) => `Welcome back, Administrator ${name}!`,
  });

  const { register, formState: { errors } } = form;

  return (
    <AuthPageLayout>
      <div className={cn("w-full", card, "p-8", "shadow-2xl")}>
        <AuthCardHeader
          icon={FaUserShield}
          title="Admin Portal"
          subtitle="Secure administrative access only"
        />

        <form onSubmit={handleLogin} className="space-y-5">
          <LoginFormFields
            register={register}
            errors={errors}
            emailLabel="Admin Email"
            passwordLabel="Secure Password"
            emailPlaceholder="admin@gradewise.ai"
            passwordPlaceholder="••••••••••••"
          />
          <LoginSubmitButton loading={loading} label="Authorize Access" icon={FaSignInAlt} />
        </form>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className={cn("text-xs", "font-semibold", "text-muted-foreground", "uppercase", "tracking-widest")}>
            System Security Level: High
          </p>
        </div>
      </div>

      <p className={cn("mt-6", "text-center", "text-muted-foreground", "text-xs")}>
        Gradewise AI Management Systems &copy; 2026
      </p>

      <Modal isOpen={modal.isOpen} onClose={closeModal} type={modal.type} title={modal.title}>
        <div className={"text-secondary-foreground"}>{modal.message}</div>
      </Modal>
    </AuthPageLayout>
  );
}

export default AdminLogin;
