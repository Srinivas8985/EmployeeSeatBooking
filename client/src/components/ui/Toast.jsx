import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ title, description, variant = 'default', duration = 4000 }) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, title, description, variant }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}

const variants = {
    default: "bg-white border-slate-200 text-slate-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-rose-50 border-rose-200 text-rose-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
};

const icons = {
    default: null,
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
};

function Toast({ title, description, variant, onClose }) {

    // Use useEffect to handle mounting animation if desired, 
    // relying on Tailwind classes for entry slide-in

    return (
        <div className={cn(
            "pointer-events-auto flex w-full items-start gap-4 rounded-xl border p-4 shadow-xl transition-all duration-300 animate-in slide-in-from-top-2 fade-in relative",
            variants[variant]
        )}>
            {icons[variant]}
            <div className="flex-1 grid gap-1">
                {title && <h3 className="font-medium text-sm">{title}</h3>}
                {description && <p className="text-sm opacity-90">{description}</p>}
            </div>
            <button
                onClick={onClose}
                className="text-slate-500 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-1"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
