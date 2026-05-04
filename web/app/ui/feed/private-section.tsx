"use client";
import { PrivateSectionProps } from "@/app/lib/types/feed";
import "./posts.css";

export default function PrivateSection({ users, privateUsers, toggleUser }: PrivateSectionProps) {
    return (
        <div className="private-users-section">
            <div className="private-users-list-header">
              <span className="private-users-title">Visible to selected followers</span>
              <span className="selected-count">{privateUsers.length} selected</span>
            </div>
            
            <div className="private-users-list">
              {users.map(user => (
                <label key={user.id} className="private-user-item">
                  <div className="private-user-avatar">{user.first_name[0].toUpperCase()}</div>
                  <div className="private-user-info">
                    <span className="private-user-name">{user.first_name + ' ' + user.last_name}</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={privateUsers.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="private-user-checkbox"
                  />
                </label>
              ))}
            </div>
          </div>
    );
}