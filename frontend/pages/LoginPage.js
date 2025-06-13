"use client"

import { useState } from "react"
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("Attempting login with:", formData)

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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Login successful:", data)

      // ✅ FIXED: Handle both response formats
      const userRole = data.user ? data.user.role : data.role
      const userData = data.user || { role: data.role }

      // Validate role matches
      if (userRole !== formData.role) {
        setError(`Access denied. You are registered as a ${userRole}, but trying to login as ${formData.role}.`)
        setLoading(false)
        return
      }

      // Store token and user data
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(userData))

      // ✅ FIXED: Use React Router navigation instead of window.location.href
      if (userRole === "doctor") {
        navigate("/doctor")
      } else if (userRole === "receptionist") {
        navigate("/receptionist")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error.message || "Login failed. Please check your credentials.")
    }

    setLoading(false)
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
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
              placeholder="Enter your email"
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
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="form-input"
              placeholder="Enter your password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">
              👤 Login as
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="form-input"
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
            <button type="button" onClick={() => navigate("/register")} className="link-button">
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
        }
        
        .error-message p {
          color: #b91c1c;
          font-size: 14px;
          margin: 0;
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
        }
        
        .submit-button:disabled {
          background: #93c5fd;
          cursor: not-allowed;
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
        }
        
        .link-button:hover {
          color: #1d4ed8;
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
