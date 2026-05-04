"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import client from "@/app/lib/services/_client";
import "./right-sidebar.css";

const suggestedUsers = [
  { id: 1, name: "Ali Ahmed", initials: "AA" },
  { id: 2, name: "Sara Lee", initials: "SL" },
  { id: 3, name: "Mounir X", initials: "MX" },
];

export default function RightSidebar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await client.get(`/search?q=${query}`);
        if (res.status === 200) setResults(res.users || []);
      } catch (err) {
        console.error("Search error", err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
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
    <aside className="right-sidebar">
      {/* Search Section */}
      <div className="right-sidebar__search-container" ref={dropdownRef}>
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="right-sidebar__search-input"
        />
        {results.length > 0 && (
          <div className="right-sidebar__search-dropdown">
            {results.map((r) => (
              <Link
                href={`/profile/${r.id || r.ID}`}
                key={r.id || r.ID}
                onClick={() => setQuery("")}
                className="right-sidebar__search-item"
              >
                {r.avatar || r.Avatar ? (
                  <img
                    src={r.avatar || r.Avatar}
                    alt="avatar"
                    className="right-sidebar__search-avatar"
                  />
                ) : (
                  <div className="right-sidebar__search-initials">
                    {(r.first_name || r.FirstName)?.[0]}
                  </div>
                )}
                <span className="right-sidebar__search-name">
                  {r.first_name} {r.last_name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Users Section */}
      <div className="right-sidebar__content">
        <div className="right-sidebar__header">
          <h3>Suggested for you</h3>
        </div>
        <ul className="right-sidebar__list">
          {suggestedUsers.map((user) => (
            <li key={user.id} className="suggestion-item">
              <div className="suggestion-avatar">{user.initials}</div>
              <div className="suggestion-info">
                <span className="suggestion-name">{user.name}</span>
              </div>
              <button className="follow-btn">Follow</button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
