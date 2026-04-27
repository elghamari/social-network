import "@/app/ui/profile/follow-modal.css"
export default function EditProfileModal({ user, onClose, isPublic, onPrivacyToggle }: any) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button onClick={onClose} className="modal-close-btn">✖</button>
        </div>
        
        <label className="privacy-toggle-wrapper" style={{ marginBottom: "20px" }}>
          <input
            type="checkbox"
            checked={!!isPublic}
            onChange={onPrivacyToggle}
            className="privacy-toggle-input"
          />
          <span className="privacy-toggle-slider"></span>
          <span className="privacy-toggle-text">Public Account</span>
        </label>

      </div>
    </div>
  );
}