"use client";

import { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  type = "info",
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  const [progress, setProgress] = useState(100);
  const [isClosing, setIsClosing] = useState(false);

  const isConfirmModal = typeof onConfirm === "function";

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 300);
  };

  // Auto close ONLY for non-confirm modals
  useEffect(() => {
    if (!isOpen || isConfirmModal) {
      setProgress(100);
      setIsClosing(false);
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.max(prev - 100 / 60, 0));
    }, 100);

    const timer = setTimeout(() => {
      handleClose();
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [isOpen, isConfirmModal]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "unset");
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
    handleClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          borderAccent: "border-l-emerald-500",
          icon: <FaCheck className="w-4 h-4" />,
          iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25",
          titleText: "text-emerald-300",
          progressBg: "bg-emerald-500",
          confirmBtn: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 focus-visible:ring-emerald-400",
        };
      case "error":
        return {
          borderAccent: "border-l-red-500",
          icon: <FaTimes className="w-4 h-4" />,
          iconBg: "bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25",
          titleText: "text-red-300",
          progressBg: "bg-red-500",
          confirmBtn: "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 focus-visible:ring-red-400",
        };
      case "warning":
        return {
          borderAccent: "border-l-amber-500",
          icon: <FaExclamationTriangle className="w-4 h-4" />,
          iconBg: "bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25",
          titleText: "text-amber-300",
          progressBg: "bg-amber-500",
          confirmBtn: "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 focus-visible:ring-red-400",
        };
      default:
        return {
          borderAccent: "border-l-indigo-500",
          icon: <FaInfoCircle className="w-4 h-4" />,
          iconBg: "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25",
          titleText: "text-indigo-300",
          progressBg: "bg-gradient-to-r from-indigo-500 to-violet-600",
          confirmBtn: "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 focus-visible:ring-indigo-400",
        };
    }
  };

  const styles = getTypeStyles();
  const ariaRole = isConfirmModal ? "dialog" : (type === "error" || type === "warning") ? "alert" : "status";

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="fixed top-4 right-4 left-1 sm:left-auto sm:right-6 md:right-8 pointer-events-auto w-full sm:max-w-md md:max-w-lg lg:max-w-xl">
        <div
          role={ariaRole}
          aria-modal={isConfirmModal ? "true" : undefined}
          aria-labelledby="modal-title"
          className={`
            bg-slate-900/95 backdrop-blur-md border border-slate-700/50 border-l-4 ${styles.borderAccent}
            rounded-2xl shadow-2xl
            transform transition-all duration-300 ease-out
            ${isClosing
              ? "translate-x-full opacity-0 scale-95"
              : "translate-x-0 opacity-100 scale-100 animate-slide-in-right"
            }
          `}
        >
          {/* Close Button — 44×44px touch target */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white transition-all duration-150 hover:scale-110 active:scale-95 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer"
            aria-label="Close notification"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>

          {/* Content Area */}
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4 mb-3">
              {/* Icon Badge */}
              <div
                className={`
                  flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${styles.iconBg}
                  flex items-center justify-center text-white text-xl sm:text-2xl font-bold
                `}
              >
                {styles.icon}
              </div>

              {/* Text Content */}
              <div className="flex-1 pr-6">
                <h3
                  id="modal-title"
                  className={`text-base sm:text-lg font-bold ${styles.titleText} mb-1.5 leading-tight`}
                >
                  {title}
                </h3>
                <div className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {children}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS (ONLY FOR CONFIRM MODALS) */}
            {isConfirmModal && (
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-5 pt-4 border-t border-slate-700/50">
                <button
                  onClick={handleClose}
                  className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-xl bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white text-sm font-medium transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer"
                >
                  {cancelText}
                </button>

                <button
                  onClick={handleConfirm}
                  className={`
                    w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-xl text-white text-sm font-semibold
                    transition-all duration-200 active:scale-95
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
                    cursor-pointer
                    ${styles.confirmBtn}
                  `}
                >
                  {confirmText}
                </button>
              </div>
            )}

            {/* PROGRESS BAR (ONLY FOR AUTO-CLOSE MODALS) */}
            {!isConfirmModal && (
              <div className="mt-4 h-1 bg-slate-700/60 rounded-full overflow-hidden">
                <div
                  className={`h-full ${styles.progressBg} transition-all duration-100 ease-linear rounded-full`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
