import { Link, Outlet, useLocation } from "react-router-dom";

export default function RootLayout() {
  const location = useLocation();
  const path = location.pathname;

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
            <Link to="/users" className={path === "/users" ? "active" : ""}>
              Users
            </Link>
          </li>
          <li>
            <Link to="/users/create" className={path === "/users/create" ? "active" : ""}>
              Create User
            </Link>
          </li>
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
