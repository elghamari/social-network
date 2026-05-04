"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/app/_context/AuthContext";
import "./navbar.css";
import client from "@/app/lib/services/_client";

export default function NavBar() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await client.get(`/search?q=${query}`);
        if (res.status === 200) {
          setResults(res.users || []);
        }
      } catch (err) {
        console.log("Search error", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="nexus-navbar">
      <div className="nexus-nav-brand">
        <Link href="/">Nexus</Link>
      </div>

      <div className="nexus-search-container" ref={dropdownRef}>
        <input
          type="text"
          placeholder="Search users or groups..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="nexus-search-input"
        />
        {results.length > 0 && (
          <div className="nexus-search-dropdown">
            {results.map((r) => (
              <Link
                href={`/profile/${r.id || r.ID}`}
                key={r.id || r.ID}
                onClick={() => setQuery("")}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  className="nexus-search-item"
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  {r.avatar || r.Avatar ? (
                    <img
                      src={r.avatar || r.Avatar}
                      alt="avatar"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        background: "var(--accent-secondary)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      {(r.first_name || r.FirstName)?.[0]}
                    </div>
                  )}
                  <span>
                    {r.first_name} {r.last_name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="nexus-nav-actions">
        {user && (
          <button className="nexus-logout-btn" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
