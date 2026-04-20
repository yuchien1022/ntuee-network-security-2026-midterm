import { useEffect, useState } from "react";
import FadeIn from "../components/FadeIn";
import services from "../services";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    services.user
      .getAll()
      .then((data) => setUsers(data))
      .catch((err) => {
        if (err.response?.status === 401) {
          setError("Please log in to view visitors.");
          return;
        }
        setError(err.response?.data?.error || "Failed to load visitors.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <section>
        <FadeIn>
          <h2>Visitors</h2>

          {loading ? (
            <div className="loading">Loading visitors…</div>
          ) : error ? (
            <div className="form-message error">{error}</div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <p>No registered visitors yet.</p>
            </div>
          ) : (
            <div className="user-list">
              {users.map((u) => (
                <div className="user-card" key={u.username}>
                  {u.avatarUrl ? (
                    <img
                      src={`${API_BASE}${u.avatarUrl}`}
                      alt={u.username}
                      className="user-avatar user-avatar-img"
                    />
                  ) : (
                    <div className="user-avatar">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="user-info">
                    <div className="user-name">{u.username}</div>
                    <div className="user-meta">
                      {u.role === "owner" ? "Site owner" : "Registered visitor"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </FadeIn>
      </section>
    </div>
  );
}
