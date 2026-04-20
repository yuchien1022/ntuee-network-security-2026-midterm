import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import services from "../services";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) navigate("/messages");
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedIn = await services.auth.login({ username, password });
      login(loggedIn);
      navigate("/messages");
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError("Invalid username or password.");
      } else if (status === 403) {
        setError("Session expired. Please refresh the page and try again.");
      } else if (!err.response) {
        setError("Server unavailable. Please check your connection.");
      } else {
        setError(err.response?.data?.error || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper">
      <section>
        <h2>Log In</h2>
        <form className="form-section" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="form-message error">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn btn-filled" disabled={loading}>
              {loading ? "Logging in…" : "Log In"}
            </button>
          </div>

          <p className="auth-switch">
            No account yet? <Link to="/register">Register</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
