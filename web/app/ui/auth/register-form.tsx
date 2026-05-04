"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/lib/services/auth";
import { RegisterInput, RegisterFieldErrors } from "@/app/lib/types/auth";
import { RegisterField } from "./register-form-field";
import { RegisterAvatarUpload } from "./register-form-avatar-upload";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<RegisterFieldErrors>({});

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
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    setErrors({});
    setLoading(true);

    try {
      const res = await authService.register(form);

      if (res.fields) {
        setErrors(res.fields);
        return;
      }

      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card auth-card--wide">
      <div className="auth-header">
        <h1 className="auth-title">Join Nexus</h1>
        <p className="auth-subtitle">
          Create your account to start connecting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-columns">
          {/* Left Column - Required */}
          <div className="auth-column">
            <h2 className="auth-section-title">Account Details</h2>

            <RegisterField
              label="First Name"
              name="first_name"
              required
              value={input.first_name}
              placeholder="John"
              errors={errors.first_name}
              onChange={handleChange}
            />

            <RegisterField
              label="Last Name"
              name="last_name"
              required
              value={input.last_name}
              placeholder="Doe"
              errors={errors.last_name}
              onChange={handleChange}
            />

            <RegisterField
              label="Email Address"
              name="email"
              type="email"
              required
              value={input.email}
              placeholder="john@example.com"
              errors={errors.email}
              onChange={handleChange}
            />

            <RegisterField
              label="Password"
              name="password"
              type="password"
              required
              value={input.password}
              placeholder="••••••••"
              errors={errors.password}
              onChange={handleChange}
            />

            <RegisterField
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              required
              value={input.date_of_birth}
              errors={errors.date_of_birth}
              onChange={handleChange}
            />
          </div>

          {/* Right Column - Optional */}
          <div className="auth-column">
            <h2 className="auth-section-title">Optional Details</h2>

            <RegisterAvatarUpload
              errors={errors.avatar}
              onError={(errs) =>
                setErrors((prev) => ({ ...prev, avatar: errs }))
              }
              onClearError={() =>
                setErrors((prev) => ({ ...prev, avatar: undefined }))
              }
            />

            <RegisterField
              label="Nickname"
              name="nickname"
              value={input.nickname || ""}
              placeholder="johnny_dev"
              errors={errors.nickname}
              onChange={handleChange}
            />

            <RegisterField
              label="About Me"
              name="about_me"
              textarea
              value={input.about_me || ""}
              placeholder="Tell the world about yourself..."
              errors={errors.about_me}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="auth-actions">
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Processing..." : "Create Account"}
          </button>
          <p className="auth-footer">
            Already have an account?{" "}
            <a href="/login" className="auth-link">
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
