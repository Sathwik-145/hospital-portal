"use client"

import { Outlet } from "react-router-dom"

export default function Layout() {
  // ✅ FIXED: Get role from user object
  const userData = localStorage.getItem("user")
  let role = null
  let userName = "User"

  if (userData) {
    try {
      const user = JSON.parse(userData)
      role = user.role
      userName = user.name || "User"
    } catch (error) {
      console.error("Error parsing user data:", error)
    }
  }

  const userDisplay = role ? `${role.charAt(0).toUpperCase() + role.slice(1)}` : "User"

  const handleLogout = () => {
    // ✅ FIXED: Remove correct localStorage items
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      {/* Navbar */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "16px 24px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  padding: "8px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ color: "white", fontWeight: "bold", fontSize: "18px" }}>H</span>
                </div>
              </div>
              <div>
                <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, letterSpacing: "0.5px" }}>
                  Hospital Portal
                </h1>
                <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "14px", margin: 0 }}>
                  Advanced Healthcare Management
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: "white",
                padding: "8px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              🔔
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 16px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                👤
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "14px", fontWeight: "600" }}>{userName}</div>
                <div style={{ fontSize: "12px", opacity: "0.8" }}>{userDisplay}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "rgba(255, 255, 255, 0.9)",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            padding: "32px",
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}
