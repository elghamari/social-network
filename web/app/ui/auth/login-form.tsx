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
<<<<<<< HEAD

=======
  
>>>>>>> origin/feed
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

<<<<<<< HEAD
    const res = await authService.login(input);
    if (!res) return;

    router.push("/");
    router.refresh();
=======
    try {
      const res = await authService.login(input);
      if (res) {
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
>>>>>>> origin/feed
  };

  return (
    <div className="nexus-login-card">
      <h1 className="nexus-title">Welcome Back</h1>
      <p className="nexus-subtitle">Log in to your Nexus account.</p>

      {error && <div className="nexus-error">{error}</div>}

      <form onSubmit={handleSubmit} className="nexus-form">
        <div className="nexus-group">
          <label className="nexus-label">Email Address</label>
<<<<<<< HEAD
          <input
            type="email"
            name="email"
            className="nexus-input"
            placeholder="name@domain.com"
            required
            onChange={handleChange}
=======
          <input 
            type="email" 
            name="email" 
            className="nexus-input" 
            placeholder="name@domain.com" 
            required 
            onChange={handleChange} 
>>>>>>> origin/feed
          />
        </div>

        <div className="nexus-group">
          <label className="nexus-label">Password</label>
<<<<<<< HEAD
          <input
            type="password"
            name="password"
            className="nexus-input"
            placeholder="••••••••"
            required
            onChange={handleChange}
=======
          <input 
            type="password" 
            name="password" 
            className="nexus-input" 
            placeholder="••••••••" 
            required 
            onChange={handleChange} 
>>>>>>> origin/feed
          />
        </div>

        <button type="submit" className="nexus-btn" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <div className="nexus-footer">
<<<<<<< HEAD
        Don't have an account?{" "}
        <a href="/register" className="nexus-link">
          Sign up
        </a>
      </div>
    </div>
  );
}
=======
        Don't have an account? <a href="/register" className="nexus-link">Sign up</a>
      </div>
    </div>
  );
}
>>>>>>> origin/feed
