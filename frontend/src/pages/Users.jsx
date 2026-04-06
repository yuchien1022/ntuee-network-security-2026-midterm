import { useEffect, useState } from "react";
import FadeIn from "../components/FadeIn";
import services from "../services";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    services.user
      .getAll()
      .then((data) => setUsers(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="page-wrapper">
      <section>
        <FadeIn>
          <h2>Users</h2>

          {loading ? (
            <div className="loading">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <p>No users yet.</p>
            </div>
          ) : (
            <div className="user-list">
              {users.map((user) => (
                <div className="user-card" key={user.id}>
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-meta">
                      Joined {formatDate(user.createdAt)}
                    </div>
                  </div>
                  <div className="user-id">
                    #{String(user.id).padStart(2, "0")}
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
