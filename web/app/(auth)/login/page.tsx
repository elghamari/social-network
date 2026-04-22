"use client";

import { useState } from "react";
import client from "@/app/lib/services/client";
import { useRouter } from "next/navigation";

export default function Login() {
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  function handleFormData(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setLoginInput({ 
      ...loginInput, 
      [name]: value 
    });
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault(); 
    setError("");

    try {
      await client.post("/login", loginInput);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <div style={{ maxWidth: "300px", margin: "auto" }}>
      <h1>Login</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input 
          type="email" 
          name="email"
          value={loginInput.email} 
          onChange={handleFormData} 
          required 
        />

        <br />

        <label htmlFor="password">Password</label>
        <input 
          type="password" 
          name="password" 
          value={loginInput.password} 
          onChange={handleFormData} 
          required 
        />

        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}