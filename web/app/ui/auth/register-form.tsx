"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/lib/services/auth";
<<<<<<< HEAD
import { RegisterInput, RegisterFieldErrors } from "@/app/lib/types/auth";
import { RegisterField } from "./register-form-field";
import { RegisterAvatarUpload } from "./register-form-avatar-upload";
=======
import { RegisterInput } from "@/app/lib/types/auth";
>>>>>>> WebSocket
import "./register.css";

export function RegisterForm() {
  const router = useRouter();
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<RegisterFieldErrors>({});
=======
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
>>>>>>> WebSocket

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

<<<<<<< HEAD
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

      console.log(res);

      if (res.fields) {
        setErrors(res.fields);
        return;
      }

      router.push("/login");
=======
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setInput((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authService.register(input);
      if (!res) return

      router.push("/login");

    } catch (err: any) {
      setError(err.message || "Connection error with Nexus server");
>>>>>>> WebSocket
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
<<<<<<< HEAD
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Join Nexus</h1>
          <p className="register-subtitle">
            Create your account to start connecting.
          </p>
        </div>

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
            <div className="register-column">
              <h2 className="register-section-title">Optional Details</h2>

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

          <div className="register-actions">
            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Processing..." : "Create Account"}
            </button>
            <p className="register-login-link">
              Already have an account? <a href="/login">Sign in</a>
            </p>
          </div>
=======
      <div className="nexus-register-card">
        <h1 className="nexus-title">Join Nexus</h1>
        <p className="nexus-subtitle">Create your account to start connecting.</p>

        {error && <div className="nexus-error">{error}</div>}

        <form onSubmit={handleSubmit} className="nexus-form">
          <div className="nexus-row">
            <div className="nexus-group">
              <label className="nexus-label">First Name</label>
              <input type="text" name="first_name" className="nexus-input" required onChange={handleChange} placeholder="John" />
            </div>
            <div className="nexus-group">
              <label className="nexus-label">Last Name</label>
              <input type="text" name="last_name" className="nexus-input" required onChange={handleChange} placeholder="Doe" />
            </div>
          </div>

          <div className="nexus-group">
            <label className="nexus-label">Email Address</label>
            <input type="email" name="email" className="nexus-input" required onChange={handleChange} placeholder="john@example.com" />
          </div>

          <div className="nexus-group">
            <label className="nexus-label">Password</label>
            <input type="password" name="password" className="nexus-input" required onChange={handleChange} placeholder="••••••••" />
          </div>

          <div className="nexus-group">
            <label className="nexus-label">Date of Birth</label>
            <input type="date" name="date_of_birth" className="nexus-input" required onChange={handleChange} />
          </div>

          <div className="nexus-divider">
            <span>Optional Details</span>
          </div>

          <div className="nexus-group">
            <label className="nexus-label">Profile Avatar</label>
            <div className="nexus-file-container">
              <input
                type="file"
                accept="image/*"
                className="nexus-input"
                onChange={handleImageChange}
                style={{ flex: 1 }}
              />
              {input.avatar && (
                <img
                  src={input.avatar}
                  alt="Avatar Preview"
                  className="nexus-avatar-preview"
                />
              )}
            </div>
          </div>

          <div className="nexus-group">
            <label className="nexus-label">Nickname</label>
            <input type="text" name="nickname" className="nexus-input" onChange={handleChange} placeholder="johnny_dev" />
          </div>

          <div className="nexus-group">
            <label className="nexus-label">About Me</label>
            <textarea name="about_me" rows={3} className="nexus-input" onChange={handleChange} placeholder="Tell the world about yourself..." style={{ resize: 'none' }} />
          </div>

          <button type="submit" className="nexus-btn" disabled={loading}>
            {loading ? "Processing..." : "Create Account"}
          </button>
>>>>>>> WebSocket
        </form>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> WebSocket
