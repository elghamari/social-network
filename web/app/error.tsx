// app/error.tsx
"use client";

import { useEffect } from "react";
import "./error.css";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="error-page">
      <div className="error-page__content">
        <div className="error-page__icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="error-page__title">Something went wrong</h1>

        <div className="error-page__actions">
          <button
            className="error-page__btn error-page__btn--primary"
            onClick={reset}
          >
            Try Again
          </button>
          <a href="/" className="error-page__btn error-page__btn--secondary">
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
