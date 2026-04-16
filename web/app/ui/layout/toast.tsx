// app/ui/toast/index.tsx
"use client";

import { useSyncExternalStore } from "react";
import { getToast, dismissToast, subscribe } from "@/app/ui/layout/toast-store";
import "./toast.css";

export default function Toast() {
  const message = useSyncExternalStore(subscribe, getToast, getToast);

  if (!message) return null;

  return (
    <div className="toast">
      <div className="toast__icon">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <span className="toast__message">{message}</span>

      <button className="toast__dismiss" onClick={dismissToast}>
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="toast__progress" />
    </div>
  );
}
