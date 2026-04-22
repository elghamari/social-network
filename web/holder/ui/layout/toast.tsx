"use client";

import { useSyncExternalStore } from "react";
import { getToast, dismissToast, subscribe } from "@/app/ui/layout/toast-store";
import "./toast.css";
import { ErrorIcon, XCancelIcon } from "../icons";

export default function Toast() {
  const message = useSyncExternalStore(subscribe, getToast, getToast);

  if (!message) return null;

  return (
    <div className="toast">
      <div className="toast__icon">
        <ErrorIcon size={18} />
      </div>

      <span className="toast__message">{message}</span>

      <button className="toast__dismiss" onClick={dismissToast}>
        <XCancelIcon size={18} />
      </button>

      <div className="toast__progress" />
    </div>
  );
}
