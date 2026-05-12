"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import client from "@/app/lib/services/_client";

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.trim() === "") {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await client.get(`/search?q=${val}`);
      if (res) {
        setSearchResults(res.users || []);
      }
    } catch (error) {
      console.log("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted, #888)" }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search users ..."
            value={searchQuery}
            onChange={handleSearchChange}
            autoFocus
            className="search-modal-input"
          />
          <button onClick={onClose} className="search-modal-close">✖</button>
        </div>

        <div className="search-modal-results">
          {isLoading ? (
            <div className="search-loading">Loading...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map((result: any) => (
              <Link href={`/profile/${result.id}`} key={result.id} className="search-result-item" onClick={onClose}>
                <div className="search-avatar">
                  {result.avatar ? (
                    <img src={result.avatar} alt="avatar" />
                  ) : (
                    <span>{result.first_name?.[0]}{result.last_name?.[0]}</span>
                  )}
                </div>
                <div className="search-info">
                  <span className="search-name">{result.first_name} {result.last_name}</span>
                  {result.nickname && <span className="search-nickname">@{result.nickname}</span>}
                </div>
              </Link>
            ))
          ) : searchQuery.trim() !== "" ? (
            <div className="search-empty">No results found</div>
          ) : (
            <div className="search-empty">Type something to search...</div>
          )}
        </div>
      </div>
    </div>
  );
}