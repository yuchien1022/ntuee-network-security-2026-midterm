import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import services from "../services";

export default function Register() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) navigate("/messages");
  }, [user, navigate]);

  function handleFileChange(e) {
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
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const newUser = await services.auth.register({ username, email, password });
      if (avatarFile) {
        try {
          const finalUser = await services.auth.uploadAvatar(avatarFile);
          login(finalUser);
          navigate("/messages");
          return;
        } catch (err) {
          login(newUser);
          setError(
            err.response?.data?.error ||
            "Account created, but avatar upload failed. Please upload your avatar from the Profile page."
          );
          navigate("/profile", {
            state: {
              uploadError:
                err.response?.data?.error ||
                "Account created, but avatar upload failed. Please upload your avatar from the Profile page.",
            },
          });
          return;
        }
      }
      login(newUser);
      navigate("/messages");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper">
      <section>
        <h2>Register</h2>
        <form className="form-section" onSubmit={handleSubmit} noValidate>
          {preview && (
            <div className="avatar-preview-wrapper">
              <img src={preview} alt="Avatar preview" className="avatar-preview" />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="e.g. yuchien_123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="avatar">Avatar (jpg/png, max 5 MB)</label>
            <input
              id="avatar"
              type="file"
              accept="image/jpeg,image/png"
              ref={fileRef}
              onChange={handleFileChange}
              className="file-input"
            />
          </div>

          {error && <div className="form-message error">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn btn-filled" disabled={loading}>
              {loading ? "Registering…" : "Register"}
            </button>
          </div>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
