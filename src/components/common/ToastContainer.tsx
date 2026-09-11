import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2 sm:p-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl bg-white animate-in slide-in-from-bottom-4 duration-200 transition-all ${
              isSuccess
                ? 'border-emerald-300 text-emerald-950'
                : isError
                ? 'border-red-300 text-red-950'
                : isWarning
                ? 'border-amber-300 text-amber-950'
                : 'border-blue-300 text-blue-950'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {isError && <AlertCircle className="w-5 h-5 text-red-600" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[#004ac6]" />}
            </div>

            <div className="flex-1 text-[13px] leading-snug font-medium pr-1">
              {toast.message}
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[#737686] hover:text-[#151c27] p-0.5 rounded cursor-pointer transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
