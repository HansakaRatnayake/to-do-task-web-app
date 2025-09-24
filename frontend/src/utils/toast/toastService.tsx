import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Info, AlertTriangle, XCircle, X } from "lucide-react";


type ToastVariant = "success" | "info" | "warning" | "error";

type Toast = {
    id: string;
    title: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
};

type ToastContextType = {
    push: (t: Omit<Toast, "id">) => string;
    remove: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within a ToastProvider");
    return ctx;
};

const DEFAULT_DURATION = 4500;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const push = (t: Omit<Toast, "id">) => {
        const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
        const toast: Toast = { id, duration: DEFAULT_DURATION, ...t };
        setToasts((s) => [toast, ...s]);
        return id;
    };

    const remove = (id: string) => {
        setToasts((s) => s.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ push, remove }}>
            {children}
            <ToastPortal toasts={toasts} onRemove={remove} />
        </ToastContext.Provider>
    );
};

const iconFor = (variant: ToastVariant | undefined) => {
    switch (variant) {
        case "success":
            return <CheckCircle className="w-5 h-5" />;
        case "warning":
            return <AlertTriangle className="w-5 h-5" />;
        case "error":
            return <XCircle className="w-5 h-5" />;
        case "info":
        default:
            return <Info className="w-5 h-5" />;
    }
};

const accentFor = (variant: ToastVariant | undefined) => {
    switch (variant) {
        case "success":
            return "bg-green-100 text-green-700 ring-green-300";
        case "warning":
            return "bg-amber-100 text-amber-700 ring-amber-300";
        case "error":
            return "bg-rose-100 text-rose-700 ring-rose-300";
        case "info":
        default:
            return "bg-sky-50 text-sky-700 ring-sky-200";
    }
};

const ToastPortal: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
    // Make a portal root if needed
    const portalRootId = "__elegant_toast_root";
    useEffect(() => {
        let root = document.getElementById(portalRootId);
        if (!root) {
            root = document.createElement("div");
            root.id = portalRootId;
            document.body.appendChild(root);
        }
        return () => {
            // keep root — don't remove to avoid flicker across mounts
        };
    }, []);

    const root = document.getElementById(portalRootId) as HTMLElement | null;
    if (!root) return null;

    return createPortal(
        <div className="pointer-events-none fixed inset-0 z-[9999] flex items-start px-4 py-6 sm:items-start sm:justify-end">
            <div className="w-full max-w-sm sm:mr-6">
                <AnimatePresence initial={false}>
                    {toasts.map((t) => (
                        <ToastCard key={t.id} toast={t} onClose={() => onRemove(t.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </div>,
        root
    );
};

const ToastCard: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
    const { title, description, variant = "info", duration = DEFAULT_DURATION } = toast;
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        startTimer();
        return clearTimer;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startTimer = () => {
        clearTimer();
        // window.setTimeout returns number
        timerRef.current = window.setTimeout(() => onClose(), duration) as unknown as number;
    };

    const clearTimer = () => {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`pointer-events-auto mb-3 w-full rounded-2xl border border-transparent shadow-lg ${accentFor(variant)} bg-white/80 backdrop-blur-lg ring-1 ring-gray-100/80`}
            onMouseEnter={() => clearTimer()}
            onMouseLeave={() => startTimer()}
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            <div className="flex items-start gap-3 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 ring-1 ring-gray-100">
                    <div className="text-current opacity-95">{iconFor(variant)}</div>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">{title}</p>
                        <button
                            onClick={onClose}
                            aria-label="Close notification"
                            className="ml-2 -mr-2 rounded-md p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    {description ? (
                        <p className="mt-1 text-xs text-gray-600 line-clamp-2">{description}</p>
                    ) : null}
                </div>
            </div>
        </motion.div>
    );
};

