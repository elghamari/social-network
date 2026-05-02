"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/lib/services/auth";
import { RegisterInput } from "@/app/lib/types/auth";
import "./register.css";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
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
        </form>
      </div>
    </div>
  );
}