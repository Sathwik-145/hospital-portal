"use client"

import { NavLink, useNavigate } from "react-router-dom"

export default function Sidebar() {
  const navigate = useNavigate()

  // ✅ FIXED: Get role from user object
  const userData = localStorage.getItem("user")
  let role = null

  if (userData) {
    try {
      const user = JSON.parse(userData)
      role = user.role
    } catch (error) {
      console.error("Error parsing user data:", error)
    }
  }

  const handleLogout = () => {
    // ✅ FIXED: Remove correct localStorage items
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo">🏥</div>
          <div>
            <h2 className="sidebar-title">MediCare Portal</h2>
            <p className="sidebar-subtitle">Healthcare Management</p>
          </div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section">
          <NavLink
            to={role === "doctor" ? "/doctor" : "/receptionist"}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">🏠</span>
            <span>Dashboard</span>
          </NavLink>

          {role === "receptionist" && (
            <NavLink to="/patients" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <span className="nav-icon">👥</span>
              <span>Patients</span>
            </NavLink>
          )}

          {role === "doctor" && (
            <NavLink to="/patients" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <span className="nav-icon">🩺</span>
              <span>Patient Records</span>
            </NavLink>
          )}
        </div>

        <div className="logout-section">
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}
