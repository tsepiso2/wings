import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Reporting from './components/Reporting';
import Navbar from './components/Navbar';  // ✅ import Navbar
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
        <Navbar />

        <main style={{ flex: 1, padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/reporting" element={<Reporting />} />
          </Routes>
        </main>

        <footer style={{
          backgroundColor: '#5c4033',
          color: '#f5f2e7',
          textAlign: 'center',
          padding: '15px 10px',
          marginTop: '20px'
        }}>
          <p>
            Contact me: <a href="mailto:tsepisomonokoane24@gmail.com" style={{ color: '#d4a373' }}>tsepisomonokoane24@gmail.com</a> | WhatsApp: <a href="https://wa.me/26669175507" target="_blank" rel="noopener noreferrer" style={{ color: '#d4a373' }}>+266 69175507</a>
          </p>
          <p>&copy; 2025 Wings Cafe</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
