"use client";
import Link from "next/link";
import "./follow-modal.css";

interface FollowerInfo {
  id: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

interface FollowModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  users?: FollowerInfo[];
}

export default function FollowModal({ title, isOpen, onClose, users }: FollowModalProps) {
  if (!isOpen) return null;

  return (
    <div className="follow-modal-overlay" onClick={onClose}>
      <div className="follow-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="follow-modal-header">
          <h3 className="follow-modal-title">{title}</h3>
          <button className="follow-modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="follow-modal-body">
          {!users || users.length === 0 ? (
            <p className="follow-modal-empty">No users to show.</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="follow-modal-item">
                <div className="follow-modal-user">
                  {u.avatar ? (
                    <img src={u.avatar} alt="avatar" className="follow-modal-avatar" />
                  ) : (
                    <div className="follow-modal-avatar follow-modal-avatar--placeholder">
                      {u.first_name?.[0]}
                    </div>
                  )}
                  <span className="follow-modal-name">
                    {u.first_name} {u.last_name}
                  </span>
                </div>

                <Link
                  href={`/profile/${u.id}`}
                  className="follow-modal-view-btn"
                  onClick={onClose}
                >
                  View Profile
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
