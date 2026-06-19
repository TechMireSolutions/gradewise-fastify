import { FaEnvelope, FaLock, FaExclamationTriangle } from "react-icons/fa";
import LoadingSpinner from "../ui/LoadingSpinner.jsx";

const inputValid =
  "w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 hover:border-slate-600 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";
const inputError =
  "w-full bg-slate-800/60 backdrop-blur-sm border border-red-500/50 hover:border-red-500/70 focus:border-red-500 rounded-xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/30";

export default function LoginFormFields({
  register,
  errors,
  emailLabel = "Email Address",
  passwordLabel = "Password",
  emailPlaceholder = "Enter your email address",
  passwordPlaceholder = "Enter your password",
}) {
  return (
    <>
      <div>
        <label className="block text-slate-400 text-sm font-medium mb-1.5">{emailLabel}</label>
        <div className="relative">
          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none" />
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            className={errors.email ? inputError : inputValid}
            placeholder={emailPlaceholder}
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1.5">
            <FaExclamationTriangle className="flex-shrink-0" />
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-slate-400 text-sm font-medium mb-1.5">{passwordLabel}</label>
        <div className="relative">
          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none" />
          <input
            {...register("password")}
            type="password"
            autoComplete="current-password"
            className={errors.password ? inputError : inputValid}
            placeholder={passwordPlaceholder}
          />
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1.5">
            <FaExclamationTriangle className="flex-shrink-0" />
            {errors.password.message}
          </p>
        )}
      </div>
    </>
  );
}

export function LoginSubmitButton({ loading, label = "Sign In", icon: Icon, disabled = false }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 min-h-[44px]"
    >
      {loading ? (
        <LoadingSpinner size="sm" color="white" type="dots" />
      ) : (
        <>
          {Icon && <Icon />}
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

export function AuthCardHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-8 text-center">
      <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 w-16 h-16 flex items-center justify-center mx-auto mb-5">
        <Icon className="text-white text-2xl" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-1">
        <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          {title}
        </span>
      </h1>
      {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
    </div>
  );
}
