import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h1>Wings Cafe</h1>
      <ul>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/inventory">Inventory</Link></li>
        <li><Link to="/sales">Sales</Link></li>
        <li><Link to="/reporting">Reporting</Link></li>
      </ul>
    </nav>
  );
}
