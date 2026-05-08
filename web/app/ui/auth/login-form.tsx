"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/lib/services/auth";
import { LoginInput } from "@/app/lib/types/auth";
import "./auth.css";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState<LoginInput>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authService.login(input);

      if (!res) return;

      if (res.errors) {
        setError(res.errors);
        return;
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Connection error with Nexus server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header auth-header--center">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Log in to your Nexus account.</p>
      </div>

      {error && <div className="auth-error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label className="auth-label">Email Address</label>
          <input
            type="email"
            name="email"
            className="auth-input"
            placeholder="name@domain.com"
            required
            onChange={handleChange}
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">Password</label>
          <input
            type="password"
            name="password"
            className="auth-input"
            placeholder="••••••••"
            required
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="auth-btn auth-btn--full"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="auth-footer">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="auth-link">
          Sign up
        </Link>
      </p>
    </div>
  );
}
