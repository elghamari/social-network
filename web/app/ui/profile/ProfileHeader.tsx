import React from "react";

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  nickname?: string;
  bio?: string;
  avatar?: string;
  email?: string;
  dateOfBirth?: string;
  children?: React.ReactNode; 
}

export default function ProfileHeader({
  firstName,
  lastName,
  nickname,
  bio,
  avatar,
  email,
  dateOfBirth,
  children,
}: ProfileHeaderProps) {
  
  const formattedDate = dateOfBirth 
    ? new Date(dateOfBirth).toLocaleDateString() 
    : null;

  return (
    <div className="profile-header">
      <div className="profile-cover" />

      <div className="profile-info">
        <div className="profile-avatar-wrapper">
          {avatar ? (
            <img src={avatar} alt="avatar" className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">
              {firstName?.[0]}
              {lastName?.[0]}
            </div>
          )}
        </div>

        <div className="profile-user-details">
          <h1 className="profile-name">
            {firstName} {lastName}
          </h1>
          {nickname && (
            <span className="profile-nickname">@{nickname}</span>
          )}
          {bio && <p className="profile-bio">{bio}</p>}
          
          <div className="profile-meta">
            {email && (
              <span className="profile-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                {email}
              </span>
            )}
            {formattedDate && (
              <span className="profile-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Born {formattedDate}
              </span>
            )}
          </div>
        </div>

        {children && <div className="profile-actions">{children}</div>}
      </div>
    </div>
  );
}