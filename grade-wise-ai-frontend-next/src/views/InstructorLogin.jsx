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
      <div className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-5">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
              <FaChalkboardTeacher className="text-2xl text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Instructor Portal</h1>
          <p className="text-slate-400 text-sm">
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

        <div className="mt-7 pt-6 border-t border-slate-700/50 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Academic Portal &bull; Secure Access
          </p>
        </div>
      </div>

      <p className="mt-6 text-center text-slate-500 text-xs">
        Gradewise AI Educator Network &copy; 2026
      </p>

      <Modal isOpen={modal.isOpen} onClose={closeModal} type={modal.type} title={modal.title}>
        <div className="text-slate-300">{modal.message}</div>
      </Modal>
    </AuthPageLayout>
  );
}

export default InstructorLogin;
