"use client";
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type Toast = { id: number; message: string; type?: "info" | "success" | "error" };

type ConfirmState = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  resolve: (ok: boolean) => void;
} | null;

type ToastContextType = {
  notify: (message: string, opts?: { type?: Toast["type"]; timeoutMs?: number }) => void;
  confirm: (opts: { title?: string; message: string; confirmText?: string; cancelText?: string }) => Promise<boolean>;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const idRef = useRef(1);

  const remove = useCallback((id: number) => {
    setToasts((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback((message: string, opts?: { type?: Toast["type"]; timeoutMs?: number }) => {
    const id = idRef.current++;
    const t: Toast = { id, message, type: opts?.type || "info" };
    setToasts((arr) => [...arr, t]);
    const ms = Math.max(1200, Math.min(opts?.timeoutMs ?? 2600, 10000));
    setTimeout(() => remove(id), ms);
  }, [remove]);

  const confirm = useCallback((opts: { title?: string; message: string; confirmText?: string; cancelText?: string }) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        title: opts.title,
        message: opts.message,
        confirmText: opts.confirmText || "Confirm",
        cancelText: opts.cancelText || "Cancel",
        resolve,
      });
    });
  }, []);

  const onConfirm = useCallback((ok: boolean) => {
    setConfirmState((s) => {
      s?.resolve(ok);
      return null;
    });
  }, []);

  const value = useMemo(() => ({ notify, confirm }), [notify, confirm]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toasts container (centered) */}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-card ${t.type || "info"}`}>
            <div className="toast-message">{t.message}</div>
          </div>
        ))}
      </div>
      {/* Confirm modal */}
      {confirmState && (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-card">
            {confirmState.title && <div className="confirm-title">{confirmState.title}</div>}
            <div className="confirm-message">{confirmState.message}</div>
            <div className="confirm-actions">
              <button className="button secondary" onClick={() => onConfirm(false)}>
                {confirmState.cancelText}
              </button>
              <button className="button" onClick={() => onConfirm(true)}>
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
