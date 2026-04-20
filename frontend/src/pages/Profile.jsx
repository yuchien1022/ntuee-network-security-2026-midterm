import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import services from "../services";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (location.state?.uploadError) {
      setError(location.state.uploadError);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Avatar must be a jpg or png file.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar must be under 5 MB.");
      e.target.value = "";
      return;
    }
    setError("");
    setSuccess("");
    setUploading(true);
    try {
      const updated = await services.auth.uploadAvatar(file);
      updateUser(updated);
      setSuccess("Avatar updated.");
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="page-wrapper">
      <section>
        <h2>My Profile</h2>
        <div className="profile-card">
          <div className="profile-avatar-wrapper">
            {user.avatarUrl ? (
              <img
                src={`${API_BASE}${user.avatarUrl}`}
                alt={user.username}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-placeholder">{user.username[0].toUpperCase()}</div>
            )}
          </div>
          <div className="profile-info">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="form-section" style={{ marginTop: "1.5rem" }}>
          <h3>Update Avatar</h3>
          <div className="form-group">
            <label htmlFor="profile-avatar">Choose jpg/png (max 5 MB)</label>
            <input
              id="profile-avatar"
              type="file"
              accept="image/jpeg,image/png"
              ref={fileRef}
              onChange={handleAvatarChange}
              className="file-input"
              disabled={uploading}
            />
          </div>
          {error && <div className="form-message error">{error}</div>}
          {success && <div className="form-message success">{success}</div>}
          {uploading && <p className="form-message">Uploading…</p>}
        </div>
      </section>
    </div>
  );
}
