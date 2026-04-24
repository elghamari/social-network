"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/lib/services/auth";
import { LoginInput } from "@/app/lib/types/auth";
import "./login.css";

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
      // router.push("/");
      router.refresh();
      if (res.status === 200) {
        router.push("/");
      } else {
        setError(res.error || "Invalid email or password");
      }
    } catch (err: any) {
      setError(err.message || "Connection error with Nexus server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="nexus-login-card">
        <h1 className="nexus-title">Welcome Back</h1>
        <p className="nexus-subtitle">Log in to your Nexus account.</p>

        {error && <div className="nexus-error">{error}</div>}

        <form onSubmit={handleSubmit} className="nexus-form">
          <div className="nexus-group">
            <label className="nexus-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="nexus-input"
              placeholder="name@domain.com"
              required
              onChange={handleChange}
            />
          </div>

          <div className="nexus-group">
            <label className="nexus-label">Password</label>
            <input
              type="password"
              name="password"
              className="nexus-input"
              placeholder="••••••••"
              required
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="nexus-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="nexus-footer">
          Don't have an account?{" "}
          <a href="/register" className="nexus-link">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
