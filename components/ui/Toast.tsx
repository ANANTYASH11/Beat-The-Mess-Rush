'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onUndo?: () => void;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const colors = {
          success: 'bg-green text-white',
          error: 'bg-red text-white',
          info: 'bg-ink text-bg',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-panel shadow-lg text-sm font-body max-w-sm transition-all duration-200 animate-[fadeIn_0.25s_ease-out] ${colors[toast.type]}`}
          >
            <span className="flex-1">{toast.message}</span>
            {toast.onUndo && (
              <button
                onClick={() => {
                  toast.onUndo?.();
                  onDismiss(toast.id);
                }}
                className="text-xs font-mono font-semibold underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity"
              >
                Undo
              </button>
            )}
            <button
              onClick={() => onDismiss(toast.id)}
              className="opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
