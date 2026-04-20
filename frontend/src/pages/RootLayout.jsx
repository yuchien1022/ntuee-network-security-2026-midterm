import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import services from "../services";

export default function RootLayout() {
  const location = useLocation();
  const path = location.pathname;
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await services.auth.logout();
    } finally {
      logout();
      navigate("/");
    }
  }

  if (user === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "0.85rem", letterSpacing: "0.1em", color: "var(--muted)", textTransform: "uppercase" }}>
          Loading…
        </p>
      </div>
    );
  }

  return (
    <>
      <nav>
        <div className="logo">
          <Link to="/">Yu Chien Hsiao</Link>
        </div>
        <ul>
          <li>
            <Link to="/" className={path === "/" ? "active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className={path === "/about" ? "active" : ""}>
              About
            </Link>
          </li>
          <li>
            <Link to="/ai-work" className={path === "/ai-work" ? "active" : ""}>
              AI Work
            </Link>
          </li>
          <li>
            <Link to="/messages" className={path === "/messages" ? "active" : ""}>
              Messages
            </Link>
          </li>

          {user ? (
            <>
              <li>
                <Link to="/profile" className={path === "/profile" ? "active" : ""}>
                  Profile
                </Link>
              </li>
              <li className="nav-user">
                {user.avatarUrl ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL ?? ""}${user.avatarUrl}`}
                    alt={user.username}
                    className="nav-avatar"
                  />
                ) : (
                  <span className="nav-avatar nav-avatar-initials">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="nav-username">{user.username}</span>
              </li>
              <li>
                <button className="btn-link" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className={path === "/login" ? "active" : ""}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className={path === "/register" ? "active" : ""}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <Outlet />

      <footer>
        <p>
          &copy; 2026 Yu Chien Hsiao &mdash; Practicum of Attack and Defense of
          Network Security
        </p>
      </footer>
    </>
  );
}