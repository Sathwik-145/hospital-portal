"use client"

import { useNavigate } from "react-router-dom"

export default function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = () => {
    // ✅ FIXED: Remove correct localStorage items
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <button onClick={handleLogout} className="logout-button">
      🚪 Logout
    </button>
  )
}
