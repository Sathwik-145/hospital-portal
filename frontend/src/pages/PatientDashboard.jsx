import { useEffect, useState } from 'react';
import Toast from '../components/Toast';

export default function PatientDashboard() {
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      } else {
        setToast({ message: 'Failed to fetch patients', type: 'error' });
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setToast({ message: 'Network error while fetching patients', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const patientData = {
      name,
      age: parseInt(age),
      gender,
      diagnosis,
      phone_number: phoneNumber
    };

    try {
      let url = 'http://localhost:8080/api/patients';
      let method = 'POST';
      
      if (editingId) {
        url = `http://localhost:8080/api/patients/${editingId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(patientData)
      });

      if (res.ok) {
        const data = await res.json();
        
        if (editingId) {
          setPatients(patients.map(p => p.id === editingId ? data : p));
          setToast({ message: 'Patient updated successfully!', type: 'success' });
        } else {
          setPatients([...patients, data]);
          setToast({ message: 'Patient added successfully!', type: 'success' });
        }
        
        resetForm();
      } else {
        const errorData = await res.json();
        setToast({ message: errorData.error || 'Failed to save patient', type: 'error' });
      }
    } catch (err) {
      console.error('Error saving patient:', err);
      setToast({ message: 'Network error while saving patient', type: 'error' });
    }
  };

  const resetForm = () => {
    setName('');
    setAge('');
    setGender('');
    setDiagnosis('');
    setPhoneNumber('');
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (patient) => {
    setName(patient.name);
    setAge(String(patient.age));
    setGender(patient.gender || '');
    setDiagnosis(patient.diagnosis || '');
    setPhoneNumber(patient.phone_number || '');
    setEditingId(patient.id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Patient Records</h1>
        <p className="dashboard-subtitle">View and manage patient information</p>
      </div>

      {role === 'receptionist' && (
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <button
            className="btn-add"
            onClick={() => setShowForm(!showForm)}
          >
            ➕ Add New Patient
          </button>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId ? 'Edit Patient' : 'Add New Patient'}
              </h2>
              <p className="modal-subtitle">
                {editingId ? 'Update patient information' : 'Enter patient details below'}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ paddingLeft: '16px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Enter age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  style={{ paddingLeft: '16px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{ paddingLeft: '16px' }}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Diagnosis/Condition</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter diagnosis or condition (optional)"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  style={{ paddingLeft: '16px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  style={{ paddingLeft: '16px' }}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-cancel" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-submit">
                  {editingId ? 'Update Patient' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="patient-grid">
        {patients.map((patient) => (
          <div key={patient.id} className="patient-card">
            <div className="patient-header">
              <div>
                <h3 className="patient-name">{patient.name}</h3>
                <span className="patient-id">ID: {patient.id}</span>
              </div>
            </div>
            
            <div className="patient-details">
              <div className="patient-detail">
                <span>👤</span>
                <span>Age: {patient.age} years</span>
              </div>
              {patient.gender && (
                <div className="patient-detail">
                  <span>⚧️</span>
                  <span>Gender: {patient.gender}</span>
                </div>
              )}
              <div className="patient-detail">
                <span>🏥</span>
                <span>Diagnosis: {patient.diagnosis || 'None specified'}</span>
              </div>
              {patient.phone_number && (
                <div className="patient-detail">
                  <span>📞</span>
                  <span>Phone: {patient.phone_number}</span>
                </div>
              )}
            </div>
            
            <div className="patient-actions">
              <button
                onClick={() => handleEdit(patient)}
                className="btn btn-edit"
              >
                ✏️ Edit
              </button>
              {role === 'receptionist' && (
                <button
                  onClick={() => handleDelete(patient.id)}
                  className="btn btn-delete"
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {patients.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3 className="empty-title">No Patients Yet</h3>
          <p className="empty-subtitle">
            {role === 'receptionist' 
              ? 'Start by adding your first patient to the system.' 
              : 'No patient records available.'}
          </p>
        </div>
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}