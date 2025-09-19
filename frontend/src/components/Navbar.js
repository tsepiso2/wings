import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  // Style for active/inactive links
  const linkStyle = ({ isActive }) => ({
    color: isActive ? "#85586F" : "#fff",
    backgroundColor: isActive ? "#DEB6AB" : "transparent",
    padding: "6px 12px",
    borderRadius: "4px",
    fontWeight: "bold",
    textDecoration: "none",
    transition: "all 0.3s"
  });

  return (
    <nav className="navbar">
      <h1>Wings Café</h1>
      <div className="nav-links-container">
        <ul className="nav-links">
          <li>
            <NavLink to="/" style={linkStyle}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/inventory" style={linkStyle}>
              Inventory
            </NavLink>
          </li>
          <li>
            <NavLink to="/sales" style={linkStyle}>
              Sales
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" style={linkStyle}>
              Reporting
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}
