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

<<<<<<< HEAD
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
=======
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
>>>>>>> origin/feed
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
<<<<<<< HEAD

=======
      
>>>>>>> origin/feed
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
<<<<<<< HEAD
      if (!res )

      router.push("/login");
=======
      
      if (res.status === 201) {
        router.push("/login");
      } else {
        setError(res.error || "Failed to create account");
      }
>>>>>>> origin/feed
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
<<<<<<< HEAD
        <p className="nexus-subtitle">
          Create your account to start connecting.
        </p>
=======
        <p className="nexus-subtitle">Create your account to start connecting.</p>
>>>>>>> origin/feed

        {error && <div className="nexus-error">{error}</div>}

        <form onSubmit={handleSubmit} className="nexus-form">
          <div className="nexus-row">
            <div className="nexus-group">
              <label className="nexus-label">First Name</label>
<<<<<<< HEAD
              <input
                type="text"
                name="first_name"
                className="nexus-input"
                required
                onChange={handleChange}
                placeholder="John"
              />
            </div>
            <div className="nexus-group">
              <label className="nexus-label">Last Name</label>
              <input
                type="text"
                name="last_name"
                className="nexus-input"
                required
                onChange={handleChange}
                placeholder="Doe"
              />
=======
              <input type="text" name="first_name" className="nexus-input" required onChange={handleChange} placeholder="John" />
            </div>
            <div className="nexus-group">
              <label className="nexus-label">Last Name</label>
              <input type="text" name="last_name" className="nexus-input" required onChange={handleChange} placeholder="Doe" />
>>>>>>> origin/feed
            </div>
          </div>

          <div className="nexus-group">
            <label className="nexus-label">Email Address</label>
<<<<<<< HEAD
            <input
              type="email"
              name="email"
              className="nexus-input"
              required
              onChange={handleChange}
              placeholder="john@example.com"
            />
=======
            <input type="email" name="email" className="nexus-input" required onChange={handleChange} placeholder="john@example.com" />
>>>>>>> origin/feed
          </div>

          <div className="nexus-group">
            <label className="nexus-label">Password</label>
<<<<<<< HEAD
            <input
              type="password"
              name="password"
              className="nexus-input"
              required
              onChange={handleChange}
              placeholder="••••••••"
            />
=======
            <input type="password" name="password" className="nexus-input" required onChange={handleChange} placeholder="••••••••" />
>>>>>>> origin/feed
          </div>

          <div className="nexus-group">
            <label className="nexus-label">Date of Birth</label>
<<<<<<< HEAD
            <input
              type="date"
              name="date_of_birth"
              className="nexus-input"
              required
              onChange={handleChange}
            />
=======
            <input type="date" name="date_of_birth" className="nexus-input" required onChange={handleChange} />
>>>>>>> origin/feed
          </div>

          <div className="nexus-divider">
            <span>Optional Details</span>
          </div>

          <div className="nexus-group">
            <label className="nexus-label">Profile Avatar</label>
            <div className="nexus-file-container">
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/feed
                  className="nexus-avatar-preview"
                />
              )}
            </div>
          </div>

          <div className="nexus-group">
            <label className="nexus-label">Nickname</label>
<<<<<<< HEAD
            <input
              type="text"
              name="nickname"
              className="nexus-input"
              onChange={handleChange}
              placeholder="johnny_dev"
            />
=======
            <input type="text" name="nickname" className="nexus-input" onChange={handleChange} placeholder="johnny_dev" />
>>>>>>> origin/feed
          </div>

          <div className="nexus-group">
            <label className="nexus-label">About Me</label>
<<<<<<< HEAD
            <textarea
              name="about_me"
              rows={3}
              className="nexus-input"
              onChange={handleChange}
              placeholder="Tell the world about yourself..."
              style={{ resize: "none" }}
            />
=======
            <textarea name="about_me" rows={3} className="nexus-input" onChange={handleChange} placeholder="Tell the world about yourself..." style={{resize: 'none'}} />
>>>>>>> origin/feed
          </div>

          <button type="submit" className="nexus-btn" disabled={loading}>
            {loading ? "Processing..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/feed
