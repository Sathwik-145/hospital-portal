"use client"

import { useState, useEffect } from "react"

const ReceptionistDashboard = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    diagnosis: "",
    phone_number: "",
    relationship: "self",
  })
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const token = localStorage.getItem("token")

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:8080/api/patients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPatients(data || [])
        setError("")
      } else {
        setError("Failed to fetch patients")
      }
    } catch (err) {
      console.error("Error fetching patients:", err)
      setError("Network error while fetching patients")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const patientData = {
        name: formData.name,
        age: Number.parseInt(formData.age),
        gender: formData.gender,
        diagnosis: formData.diagnosis,
        phone_number: formData.phone_number,
        relationship: formData.relationship,
      }

      let url = "http://localhost:8080/api/patients"
      let method = "POST"

      if (editingId) {
        url = `http://localhost:8080/api/patients/${editingId}`
        method = "PUT"
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patientData),
      })

      if (response.ok) {
        setSuccess(editingId ? "Patient updated successfully!" : "Patient added successfully!")
        resetForm()
        fetchPatients()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to save patient")
      }
    } catch (err) {
      console.error("Error saving patient:", err)
      setError("Network error while saving patient")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return

    try {
      const response = await fetch(`http://localhost:8080/api/patients/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setSuccess("Patient deleted successfully!")
        fetchPatients()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to delete patient")
      }
    } catch (err) {
      console.error("Error deleting patient:", err)
      setError("Network error while deleting patient")
    }
  }

  const handleEdit = (patient) => {
    setFormData({
      name: patient.name || "",
      age: patient.age ? String(patient.age) : "",
      gender: patient.gender || "",
      diagnosis: patient.diagnosis || "",
      phone_number: patient.phone_number || "",
      relationship: patient.relationship || "self",
    })
    setEditingId(patient.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      gender: "",
      diagnosis: "",
      phone_number: "",
      relationship: "self",
    })
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="receptionist-dashboard">
      <div className="dashboard-header">
        <h1>👩‍💼 Receptionist Dashboard</h1>
        <p>Manage patient registrations and information</p>
      </div>
      <button
      onClick={() => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }}
      style={{
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "bold",
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(239, 68, 68, 0.3)",
        transition: "all 0.2s ease",
        position: "absolute",
        top: "20px",
        right: "20px",
        zIndex: 1000
      }}
      onMouseOver={(e) => {
        e.target.style.transform = "translateY(-1px)"
        e.target.style.boxShadow = "0 4px 8px rgba(239, 68, 68, 0.4)"
      }}
      onMouseOut={(e) => {
        e.target.style.transform = "translateY(0)"
        e.target.style.boxShadow = "0 2px 4px rgba(239, 68, 68, 0.3)"
      }}
    >
      🚪 Logout
    </button>
      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card" style={{ backgroundColor: "#4ade80" }}>
          <div className="stat-content">
            <h3>Total Patients</h3>
            <p className="stat-number">{patients.length}</p>
          </div>
          <div className="stat-icon">👥</div>
        </div>

        <div className="stat-card" style={{ backgroundColor: "#60a5fa" }}>
          <div className="stat-content">
            <h3>Active Cases</h3>
            <p className="stat-number">
              {patients.filter((p) => p.diagnosis && p.diagnosis !== "None specified").length}
            </p>
          </div>
          <div className="stat-icon">🏥</div>
        </div>

        <div className="stat-card" style={{ backgroundColor: "#c084fc" }}>
          <div className="stat-content">
            <h3>Family Members</h3>
            <p className="stat-number">{patients.filter((p) => p.relationship && p.relationship !== "self").length}</p>
          </div>
          <div className="stat-icon">👨‍👩‍👧‍👦</div>
        </div>

        <div className="stat-card" style={{ backgroundColor: "#fb923c" }}>
          <div className="stat-content">
            <h3>Today's Registrations</h3>
            <p className="stat-number">
              {
                patients.filter(
                  (p) => p.created_at && new Date(p.created_at).toDateString() === new Date().toDateString(),
                ).length
              }
            </p>
          </div>
          <div className="stat-icon">📅</div>
        </div>
      </div>

      {/* Action Button */}
      <div className="action-container">
        <button className="add-button" onClick={() => setShowForm(true)}>
          ➕ Add New Patient
        </button>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="message error-message">
          <p>❌ {error}</p>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {success && (
        <div className="message success-message">
          <p>✅ {success}</p>
          <button onClick={() => setSuccess("")}>×</button>
        </div>
      )}

      {/* Patient List */}
      <div className="patients-section">
        <h2>📋 Patient Records</h2>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No Patients Yet</h3>
            <p>Start by adding your first patient to the system.</p>
          </div>
        ) : (
          <div className="patients-grid">
            {patients.map((patient) => (
              <div key={patient.id} className="patient-card">
                <div className="patient-header">
                  <h3>{patient.name}</h3>
                  <span className="patient-id">ID: {patient.id}</span>
                </div>

                <div className="patient-details">
                  <p>
                    <span>👤</span> Age: {patient.age} years
                  </p>
                  {patient.gender && (
                    <p>
                      <span>⚧️</span> Gender: {patient.gender}
                    </p>
                  )}
                  <p>
                    <span>🏥</span> Diagnosis: {patient.diagnosis || "None specified"}
                  </p>
                  {patient.phone_number && (
                    <p>
                      <span>📞</span> Phone: {patient.phone_number}
                    </p>
                  )}
                  {patient.relationship && (
                    <p>
                      <span>👥</span> Relationship: {patient.relationship}
                    </p>
                  )}
                </div>

                <div className="patient-actions">
                  <button className="edit-button" onClick={() => handleEdit(patient)}>
                    ✏️ Edit
                  </button>
                  <button className="delete-button" onClick={() => handleDelete(patient.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Patient Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? "Edit Patient" : "Add New Patient"}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>👤 Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter patient name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>🎂 Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Enter age"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>⚧️ Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>📞 Phone Number</label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label>👥 Relationship</label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  required
                >
                  <option value="self">Self (Patient)</option>
                  <option value="son">Son</option>
                  <option value="daughter">Daughter</option>
                  <option value="spouse">Spouse</option>
                  <option value="mother">Mother</option>
                  <option value="father">Father</option>
                  <option value="brother">Brother</option>
                  <option value="sister">Sister</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>🏥 Diagnosis</label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="Enter diagnosis or condition (optional)"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  {editingId ? "Update Patient" : "Add Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .receptionist-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .dashboard-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .dashboard-header h1 {
          font-size: 32px;
          color: #4338ca;
          margin-bottom: 8px;
        }
        
        .dashboard-header p {
          color: #6b7280;
          font-size: 16px;
        }
        
        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          border-radius: 12px;
          padding: 20px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .stat-content h3 {
          font-size: 16px;
          margin: 0 0 8px 0;
          opacity: 0.9;
        }
        
        .stat-number {
          font-size: 28px;
          font-weight: bold;
          margin: 0;
        }
        
        .stat-icon {
          font-size: 32px;
          opacity: 0.8;
        }
        
        .action-container {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }
        
        .add-button {
          background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(99, 102, 241, 0.5);
          transition: all 0.3s ease;
        }
        
        .add-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 10px rgba(99, 102, 241, 0.6);
        }
        
        .message {
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .error-message {
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }
        
        .success-message {
          background-color: #dcfce7;
          border: 1px solid #bbf7d0;
          color: #15803d;
        }
        
        .message p {
          margin: 0;
        }
        
        .message button {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: inherit;
        }
        
        .patients-section {
          margin-top: 20px;
        }
        
        .patients-section h2 {
          font-size: 24px;
          color: #1f2937;
          margin-bottom: 20px;
        }
        
        .loading-container {
          text-align: center;
          padding: 40px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #4338ca;
          border-radius: 50%;
          margin: 0 auto 16px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background-color: #f9fafb;
          border-radius: 12px;
          border: 2px dashed #e5e7eb;
        }
        
        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          color: #9ca3af;
        }
        
        .empty-state h3 {
          font-size: 20px;
          color: #4b5563;
          margin-bottom: 8px;
        }
        
        .empty-state p {
          color: #6b7280;
        }
        
        .patients-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .patient-card {
          background-color: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }
        
        .patient-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
          border-color: #c7d2fe;
        }
        
        .patient-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
          border-bottom: 1px solid #f3f4f6;
          padding-bottom: 10px;
        }
        
        .patient-header h3 {
          font-size: 18px;
          margin: 0;
          color: #1f2937;
        }
        
        .patient-id {
          background-color: #e0e7ff;
          color: #4338ca;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
        
        .patient-details {
          margin-bottom: 15px;
        }
        
        .patient-details p {
          margin: 8px 0;
          color: #4b5563;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .patient-details span {
          font-size: 16px;
        }
        
        .patient-actions {
          display: flex;
          gap: 10px;
        }
        
        .edit-button, .delete-button {
          flex: 1;
          padding: 8px 0;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .edit-button {
          background-color: #dbeafe;
          color: #2563eb;
        }
        
        .edit-button:hover {
          background-color: #bfdbfe;
        }
        
        .delete-button {
          background-color: #fee2e2;
          color: #dc2626;
        }
        
        .delete-button:hover {
          background-color: #fecaca;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        
        .modal-content {
          background-color: white;
          border-radius: 12px;
          padding: 30px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .modal-content h2 {
          text-align: center;
          margin-top: 0;
          margin-bottom: 20px;
          color: #4338ca;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #4b5563;
        }
        
        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          outline: none;
          border-color: #a5b4fc;
          box-shadow: 0 0 0 3px rgba(165, 180, 252, 0.2);
        }
        
        .form-actions {
          display: flex;
          gap: 15px;
          margin-top: 30px;
        }
        
        .cancel-button, .submit-button {
          flex: 1;
          padding: 12px 0;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .cancel-button {
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          color: #4b5563;
        }
        
        .cancel-button:hover {
          background-color: #e5e7eb;
        }
        
        .submit-button {
          background-color: #4338ca;
          border: none;
          color: white;
        }
        
        .submit-button:hover {
          background-color: #4f46e5;
        }
      `}</style>
    </div>
  )
}

export default ReceptionistDashboard






