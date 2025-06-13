"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "receptionist",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // ✅ ADDED: Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (token && user) {
      try {
        const userData = JSON.parse(user)
        // Redirect to appropriate dashboard if already logged in
        if (userData.role === "doctor") {
          navigate("/doctor")
        } else if (userData.role === "receptionist") {
          navigate("/receptionist")
        }
      } catch (error) {
        // Clear invalid user data
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
  }, [navigate])

  // ✅ ADDED: Input validation
  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!formData.password.trim()) {
      setError("Password is required")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // ✅ ADDED: Client-side validation
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      console.log("Attempting login with:", { email: formData.email, role: formData.role })

      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      // ✅ IMPROVED: Better error handling
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        throw new Error("Invalid response from server")
      }

      if (!response.ok) {
        throw new Error(data.error || `Login failed with status: ${response.status}`)
      }

      console.log("Login successful:", data)

      // ✅ IMPROVED: Better response validation
      if (!data.token) {
        throw new Error("No authentication token received")
      }

      // Handle both response formats
      const userRole = data.user ? data.user.role : data.role
      const userData = data.user || {
        role: data.role,
        email: formData.email,
        name: data.name || "User",
      }

      if (!userRole) {
        throw new Error("No user role found in response")
      }

      // Validate role matches
      if (userRole !== formData.role) {
        setError(`Access denied. You are registered as a ${userRole}, but trying to login as ${formData.role}.`)
        setLoading(false)
        return
      }

      // Store token and user data
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(userData))

      // ✅ ADDED: Success feedback
      console.log(`✅ Login successful! Redirecting to ${userRole} dashboard...`)

      // Navigate based on role
      if (userRole === "doctor") {
        navigate("/doctor")
      } else if (userRole === "receptionist") {
        navigate("/receptionist")
      } else {
        throw new Error(`Unknown user role: ${userRole}`)
      }
    } catch (error) {
      console.error("Login error:", error)

      // ✅ IMPROVED: Better error messages
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setError("Unable to connect to server. Please check your internet connection.")
      } else if (error.message.includes("401") || error.message.includes("Invalid credentials")) {
        setError("Invalid email or password. Please try again.")
      } else if (error.message.includes("403")) {
        setError("Access forbidden. Please contact administrator.")
      } else {
        setError(error.message || "Login failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // ✅ ADDED: Clear error when user types
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    if (error) {
      setError("")
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="hospital-icon">🏥</div>
          <h2 className="login-title">Hospital Portal</h2>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              📧 Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="form-input"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              🔒 Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">
              👤 Login as
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange("role", e.target.value)}
              className="form-input"
              disabled={loading}
            >
              <option value="receptionist">👩‍💼 Receptionist</option>
              <option value="doctor">👨‍⚕️ Doctor</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? (
              <span className="loading-content">
                <span className="spinner"></span>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <button type="button" onClick={() => navigate("/register")} className="link-button" disabled={loading}>
              Register here
            </button>
          </p>
          <p className="server-info">
            Server: <span className="server-url">http://localhost:8080</span>
          </p>
          <p className="endpoint-info">
            Endpoint: <span className="server-url">/auth/login</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #e0f2fe 0%, #e1e5fe 50%, #f3e5f5 100%);
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .login-card {
          max-width: 400px;
          width: 100%;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          padding: 32px;
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .hospital-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .login-title {
          font-size: 30px;
          font-weight: bold;
          color: #111827;
          margin: 0 0 8px 0;
        }
        
        .login-subtitle {
          color: #6b7280;
          margin: 0;
        }
        
        .error-message {
          margin-bottom: 24px;
          padding: 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          animation: shake 0.5s ease-in-out;
        }
        
        .error-message p {
          color: #b91c1c;
          font-size: 14px;
          margin: 0;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }
        
        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .form-input:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
        }
        
        .submit-button {
          width: 100%;
          background: #2563eb;
          color: white;
          font-weight: 500;
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .submit-button:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
        }
        
        .submit-button:disabled {
          background: #93c5fd;
          cursor: not-allowed;
          transform: none;
        }
        
        .loading-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .login-footer {
          margin-top: 24px;
          text-align: center;
        }
        
        .login-footer p {
          font-size: 12px;
          color: #6b7280;
          margin: 4px 0;
        }
        
        .link-button {
          background: none;
          border: none;
          color: #2563eb;
          cursor: pointer;
          text-decoration: underline;
          font-size: 12px;
          transition: color 0.2s;
        }
        
        .link-button:hover:not(:disabled) {
          color: #1d4ed8;
        }
        
        .link-button:disabled {
          color: #9ca3af;
          cursor: not-allowed;
        }
        
        .server-url {
          font-family: monospace;
          color: #2563eb;
        }
      `}</style>
    </div>
  )
}

export default LoginPage
