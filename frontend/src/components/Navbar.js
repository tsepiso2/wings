import React from "react";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h1>Wings Cafe</h1>
      <ul>
        <li><a href="/">Dashboard</a></li>
        <li><a href="/inventory">Inventory</a></li>
        <li><a href="/sales">Sales</a></li>
        <li><a href="/reports">Reports</a></li>
      </ul>
    </nav>
  );
}
