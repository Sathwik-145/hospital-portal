"use client"

import { useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router-dom"

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const location = useLocation()

  useEffect(() => {
    console.log("ProtectedRoute: Checking authentication...")

    // Check if user is authenticated
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    console.log("Token exists:", !!token)
    console.log("User data exists:", !!userData)

    if (!token || !userData) {
      console.log("❌ No token or user data found")
      setIsAuthenticated(false)
      setIsLoading(false)
      return
    }

    try {
      // Parse the user data to get the role
      const user = JSON.parse(userData)
      const role = user.role

      console.log("✅ User role from localStorage:", role)
      console.log("✅ Allowed roles:", allowedRoles)

      // Check if user role is allowed
      const hasAllowedRole = allowedRoles.length === 0 || allowedRoles.includes(role)

      if (!hasAllowedRole) {
        console.log("❌ User role not allowed:", role)
        setIsAuthenticated(false)
      } else {
        console.log("✅ User role allowed, granting access")
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("❌ Error parsing user data:", error)
      setIsAuthenticated(false)
      // Clear invalid data
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }

    setIsLoading(false)
  }, [allowedRoles])

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid rgba(255, 255, 255, 0.3)",
            borderTop: "4px solid white",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log("❌ Not authenticated, redirecting to login")
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  console.log("✅ Authentication successful, rendering protected content")
  return children
}

export default ProtectedRoute
