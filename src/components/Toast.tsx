'use client';

import React, { useEffect } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-emerald-900 border-emerald-700 text-emerald-100',
    error: 'bg-rose-900 border-rose-700 text-rose-100',
    info: 'bg-slate-900 border-slate-700 text-slate-100',
  };

  const icons = {
    success: '✅',
    error: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5 ${bgColors[type]}`}>
      <span className="text-base">{icons[type]}</span>
      <span className="text-sm font-bold tracking-wide">{message}</span>
      <button
        onClick={onClose}
        className="ml-3 text-xs font-bold opacity-70 hover:opacity-100 transition"
      >
        ✕
      </button>
    </div>
  );
}