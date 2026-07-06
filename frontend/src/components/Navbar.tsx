import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <NavLink to="/" end>
        Dashboard
      </NavLink>
      <NavLink to="/files">Files</NavLink>
      <NavLink to="/risks">Risks</NavLink>
      <button onClick={logout} style={{ marginLeft: "auto" }}>
        Logout
      </button>
    </nav>
  );
}
