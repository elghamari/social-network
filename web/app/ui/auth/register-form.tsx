"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/lib/services/auth";
import { RegisterInput, RegisterFieldErrors } from "@/app/lib/types/auth";
import { RegisterField } from "./register-form-field";
import { RegisterAvatarUpload } from "./register-form-avatar-upload";
import "./register.css";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});

  const [input, setInput] = useState<RegisterInput>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    nickname: "",
    avatar: "",
    about_me: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await authService.register(form);

      if (res.error) {
        setError(res.error);
        return;
      }

      if (res.fields) {
        setFieldErrors(res.fields);
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Join Nexus</h1>
          <p className="register-subtitle">
            Create your account to start connecting.
          </p>
        </div>

        {error && (
          <div className="register-error-banner">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-columns">
            {/* Left Column - Required */}
            <div className="register-column">
              <h2 className="register-section-title">Account Details</h2>

              <RegisterField
                label="First Name"
                name="first_name"
                required
                value={input.first_name}
                placeholder="John"
                errors={fieldErrors.first_name}
                onChange={handleChange}
              />

              <RegisterField
                label="Last Name"
                name="last_name"
                required
                value={input.last_name}
                placeholder="Doe"
                errors={fieldErrors.last_name}
                onChange={handleChange}
              />

              <RegisterField
                label="Email Address"
                name="email"
                type="email"
                required
                value={input.email}
                placeholder="john@example.com"
                errors={fieldErrors.email}
                onChange={handleChange}
              />

              <RegisterField
                label="Password"
                name="password"
                type="password"
                required
                value={input.password}
                placeholder="••••••••"
                errors={fieldErrors.password}
                onChange={handleChange}
              />

              <RegisterField
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                required
                value={input.date_of_birth}
                errors={fieldErrors.date_of_birth}
                onChange={handleChange}
              />
            </div>

            {/* Right Column - Optional */}
            <div className="register-column">
              <h2 className="register-section-title">Optional Details</h2>

              <RegisterAvatarUpload
                errors={fieldErrors.avatar}
                onError={(errs) =>
                  setFieldErrors((prev) => ({ ...prev, avatar: errs }))
                }
                onClearError={() =>
                  setFieldErrors((prev) => ({ ...prev, avatar: undefined }))
                }
              />

              <RegisterField
                label="Nickname"
                name="nickname"
                value={input.nickname || ""}
                placeholder="johnny_dev"
                errors={fieldErrors.nickname}
                onChange={handleChange}
              />

              <RegisterField
                label="About Me"
                name="about_me"
                textarea
                value={input.about_me || ""}
                placeholder="Tell the world about yourself..."
                errors={fieldErrors.about_me}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="register-actions">
            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Processing..." : "Create Account"}
            </button>
            <p className="register-login-link">
              Already have an account? <a href="/login">Sign in</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
