// app/error.tsx
"use client";

import { useEffect } from "react";
import "./error.css";
import { ErrorIcon } from "./ui/icons";

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
          <ErrorIcon size={30} />
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
