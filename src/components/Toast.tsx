import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Copy } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    info: <Copy className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  return (
    <div className="pointer-events-auto flex items-start gap-3 p-4 bg-slate-900/95 text-slate-100 rounded-xl shadow-xl border border-slate-800 backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3 duration-200">
      {icons[toast.type]}
      <div className="flex-1 text-sm">
        <p className="font-semibold text-slate-100">{toast.title}</p>
        {toast.description && <p className="text-slate-400 text-xs mt-0.5">{toast.description}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-500 hover:text-slate-300 p-1 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
