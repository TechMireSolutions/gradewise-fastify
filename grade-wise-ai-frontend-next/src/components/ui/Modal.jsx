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
          bg: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-emerald-950/40 dark:to-green-950/40",
          border: "border-green-500",
          icon: <FaCheck className="w-4 h-4" />,
          iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
          text: "text-green-900 dark:text-emerald-200",
          progressBg: "bg-green-500",
        };
      case "error":
        return {
          bg: "bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/40 dark:to-pink-950/40",
          border: "border-red-500",
          icon: <FaTimes className="w-4 h-4" />,
          iconBg: "bg-gradient-to-br from-red-500 to-pink-600",
          text: "text-red-900 dark:text-red-200",
          progressBg: "bg-red-500",
        };
      case "warning":
        return {
          bg: "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/40 dark:to-amber-950/40",
          border: "border-yellow-500",
          icon: <FaExclamationTriangle className="w-4 h-4" />,
          iconBg: "bg-gradient-to-br from-yellow-500 to-amber-600",
          text: "text-yellow-900 dark:text-yellow-200",
          progressBg: "bg-yellow-500",
        };
      default:
        return {
          bg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-indigo-950/40 dark:to-blue-950/40",
          border: "border-blue-500",
          icon: <FaInfoCircle className="w-4 h-4" />,
          iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
          text: "text-blue-900 dark:text-indigo-200",
          progressBg: "bg-blue-500",
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
            bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-l-4 ${styles.border}
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
            className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            aria-label="Close notification"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>

          {/* Content Area */}
          <div className={`p-5 sm:p-6 ${styles.bg} rounded-2xl`}>
            <div className="flex items-start gap-4 mb-3">
              {/* Icon Badge */}
              <div
                className={`
                  flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full ${styles.iconBg}
                  flex items-center justify-center text-white text-xl sm:text-2xl font-bold
                  shadow-lg
                `}
              >
                {styles.icon}
              </div>

              {/* Text Content */}
              <div className="flex-1 pr-6">
                <h3 id="modal-title" className={`text-base sm:text-lg font-bold ${styles.text} mb-1.5 leading-tight`}>
                  {title}
                </h3>
                <div className="text-sm sm:text-base text-gray-700 dark:text-slate-300 leading-relaxed">
                  {children}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS (ONLY FOR CONFIRM MODALS) */}
            {isConfirmModal && (
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-5 pt-4 border-t border-gray-200 dark:border-slate-600">
                <button
                  onClick={handleClose}
                  className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-sm font-semibold text-gray-700 dark:text-slate-200 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  {cancelText}
                </button>

                <button
                  onClick={handleConfirm}
                  className={`
                    w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-xl text-white text-sm font-semibold
                    transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
                    ${type === "warning"
                      ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus-visible:ring-red-400"
                      : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 focus-visible:ring-violet-400"
                    }
                  `}
                >
                  {confirmText}
                </button>
              </div>
            )}

            {/* PROGRESS BAR (ONLY FOR AUTO-CLOSE MODALS) */}
            {!isConfirmModal && (
              <div className="mt-4 h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden shadow-inner">
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
