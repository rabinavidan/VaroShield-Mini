import { NavLink, useNavigate } from "react-router-dom";
import { clearAuth, getRole } from "../auth";

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" strokeLinejoin="round" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function FilesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4l2 2h8A1.5 1.5 0 0 1 21 7.5v11A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5v-13Z" strokeLinejoin="round" />
    </svg>
  );
}

function RisksIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3 2 20h20L12 3Z" strokeLinejoin="round" />
      <path d="M12 10v4" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const role = getRole();

  function logout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <ShieldIcon />
        <span>VaroShield</span>
      </div>

      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          <DashboardIcon />
          Dashboard
        </NavLink>
        <NavLink to="/files" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          <FilesIcon />
          Files
        </NavLink>
        <NavLink to="/risks" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          <RisksIcon />
          Risks
        </NavLink>
      </div>

      <div className="navbar-actions">
        {role && <span className="role-badge">{role}</span>}
        <button className="btn-ghost" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
