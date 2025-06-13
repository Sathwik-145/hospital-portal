import { useState, useEffect } from 'react';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPatient, setEditingPatient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [familyHistory, setFamilyHistory] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familySummary, setFamilySummary] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const token = localStorage.getItem('token');

  // Fetch patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      console.log('Fetching patients...');
      const response = await fetch('http://localhost:8080/api/patients', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Patients fetched:', data);
      setPatients(data || []);
      setError('');
    } catch (err) {
      setError('Failed to load patients');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch complete family history by phone number
  const fetchFamilyHistoryByPhone = async (phoneNumber) => {
    try {
      setLoadingHistory(true);
      console.log(`Fetching complete family history for phone ${phoneNumber}...`);
      const response = await fetch(`http://localhost:8080/api/patients/phone/${phoneNumber}/family-history`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Complete family history:', data);
        setFamilyHistory(data.medical_history || []);
        setFamilyMembers(data.family_members || []);
        setFamilySummary(data.family_summary || {});
      } else {
        console.log('No family history found');
        setFamilyHistory([]);
        setFamilyMembers([]);
        setFamilySummary({});
      }
    } catch (err) {
      console.error('Failed to fetch family history:', err);
      setFamilyHistory([]);
      setFamilyMembers([]);
      setFamilySummary({});
    } finally {
      setLoadingHistory(false);
    }
  };

  // Update patient
  const updatePatient = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      console.log('Updating patient:', editingPatient);
      
      const response = await fetch(`http://localhost:8080/api/patients/${editingPatient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingPatient.name,
          age: editingPatient.age,
          gender: editingPatient.gender,
          phone_number: editingPatient.phone_number,
          relationship: editingPatient.relationship,
          diagnosis: editingPatient.diagnosis || '',
          medical_notes: editingPatient.medical_notes || '',
          prescriptions: editingPatient.prescriptions || '',
          last_checkup: editingPatient.last_checkup || '',
          next_appointment: editingPatient.next_appointment || ''
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to update patient: ${errorData}`);
      }
      
      const result = await response.json();
      console.log('Update result:', result);
      
      // Refresh patient list and family history
      await fetchPatients();
      await fetchFamilyHistoryByPhone(editingPatient.phone_number);
      
      alert('✅ Patient medical record updated successfully!');
    } catch (err) {
      alert(`❌ Error updating patient: ${err.message}`);
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Open edit modal
  const handleEdit = async (patient) => {
    console.log('Editing patient:', patient);
    setEditingPatient({
      ...patient,
      medical_notes: patient.medical_notes || '',
      prescriptions: patient.prescriptions || '',
      last_checkup: patient.last_checkup || new Date().toISOString().split('T')[0],
      next_appointment: patient.next_appointment || ''
    });
    
    // Fetch complete family history by phone number
    await fetchFamilyHistoryByPhone(patient.phone_number);
    setShowEditModal(true);
  };

  // Close edit modal
  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingPatient(null);
    setFamilyHistory([]);
    setFamilyMembers([]);
    setFamilySummary({});
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingPatient({
      ...editingPatient,
      [name]: value,
    });
  };

  // Get relationship emoji
  const getRelationshipEmoji = (relationship) => {
    const emojis = {
      'self': '👤',
      'son': '👦',
      'daughter': '👧',
      'mother': '👩',
      'father': '👨',
      'spouse': '💑',
      'brother': '👦',
      'sister': '👧',
      'grandfather': '👴',
      'grandmother': '👵',
      'other': '👥'
    };
    return emojis[relationship] || '👤';
  };

  // Get relationship display name
  const getRelationshipDisplay = (relationship) => {
    const displays = {
      'self': 'Self',
      'son': 'Son',
      'daughter': 'Daughter',
      'mother': 'Mother',
      'father': 'Father',
      'spouse': 'Spouse',
      'brother': 'Brother',
      'sister': 'Sister',
      'grandfather': 'Grandfather',
      'grandmother': 'Grandmother',
      'other': 'Other'
    };
    return displays[relationship] || 'Unknown';
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div className="content">
      <div className="content-card">
        <div className="dashboard-header">
          <h1 className="dashboard-title">👨‍⚕️ Doctor Dashboard</h1>
          <p className="dashboard-subtitle">Review and update patient medical records with family history tracking</p>
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

        {/* Enhanced Stats cards */}
        <div className="stats-grid">
          <div className="stat-card green">
            <div className="stat-info">
              <h3>Total Patients</h3>
              <p>{patients.length}</p>
            </div>
            <div className="stat-icon">👥</div>
          </div>
          
          <div className="stat-card blue">
            <div className="stat-info">
              <h3>Active Cases</h3>
              <p>{patients.filter(p => p.diagnosis && p.diagnosis !== 'None specified' && p.diagnosis !== '').length}</p>
            </div>
            <div className="stat-icon">📋</div>
          </div>
          
          <div className="stat-card purple">
            <div className="stat-info">
              <h3>Family Patients</h3>
              <p>{patients.filter(p => p.relationship !== 'self').length}</p>
            </div>
            <div className="stat-icon">👨‍👩‍👧‍👦</div>
          </div>

          <div className="stat-card orange">
            <div className="stat-info">
              <h3>Today's Updates</h3>
              <p>{patients.filter(p => p.updated_at && new Date(p.updated_at).toDateString() === new Date().toDateString()).length}</p>
            </div>
            <div className="stat-icon">🩺</div>
          </div>
        </div>

        {/* Patient Records */}
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            📋 Patient Records
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Click on any patient to view their complete family medical history and update current condition
          </p>

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>🔄 Loading patients...</p>
            </div>
          )}
          
          {error && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p className="error-message">❌ {error}</p>
              <button 
                onClick={fetchPatients}
                style={{ 
                  marginTop: '10px', 
                  padding: '8px 16px', 
                  backgroundColor: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🔄 Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {patients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p>📭 No patients found.</p>
                </div>
              ) : (
                <div className="patient-grid">
                  {patients.map((patient) => {
                    const hasHistory = patient.medical_history && patient.medical_history.length > 0;
                    return (
                      <div key={patient.id} className={`patient-card ${hasHistory ? 'returning-patient' : 'new-patient'}`}>
                        <div className="patient-header">
                          <h3 className="patient-name">
                            {getRelationshipEmoji(patient.relationship)} {patient.name}
                          </h3>
                          <div className="patient-badges">
                            <span className="patient-id">ID: {patient.id}</span>
                            <span className="relationship-badge">
                              {getRelationshipDisplay(patient.relationship)}
                            </span>
                            {hasHistory && <span className="returning-badge">🔄 Has History</span>}
                          </div>
                        </div>
                        
                        <div className="patient-details">
                          <div className="patient-detail">
                            👤 Age: {patient.age} years | Gender: {patient.gender}
                          </div>
                          <div className="patient-detail">
                            📞 Phone: {patient.phone_number}
                          </div>
                          <div className="patient-detail relationship-info">
                            👥 Relationship: {getRelationshipDisplay(patient.relationship)}
                          </div>
                          <div className="patient-detail">
                            🏥 Current Diagnosis: {patient.diagnosis || 'None specified'}
                          </div>
                          {patient.prescriptions && (
                            <div className="patient-detail">
                              💊 Current Medications: {patient.prescriptions}
                            </div>
                          )}
                          {patient.last_checkup && (
                            <div className="patient-detail">
                              🗓️ Last Checkup: {patient.last_checkup}
                            </div>
                          )}
                          {hasHistory && (
                            <div className="patient-detail history-indicator">
                              📚 Previous Visits: {patient.medical_history.length}
                            </div>
                          )}
                          {patient.updated_at && (
                            <div className="patient-detail">
                              ⏰ Last Updated: {new Date(patient.updated_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        <div className="patient-actions">
                          <button 
                            className="btn btn-edit"
                           onClick={() => handleEdit(patient)}
                           //❌⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️
//                             onClick={async () => {
//   try {
//     // First fetch the family data in the current context
//     const token = localStorage.getItem('token');
//     let familyData = { family_members: [], medical_history: [], family_summary: {} };
    
//     if (patient.phone_number && token) {
//       const response = await fetch(`http://localhost:8080/api/patients/family/${patient.phone_number}`, {
//         headers: { 
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.ok) {
//         familyData = await response.json();
//       }
//     }
    
//     // Now open the new tab with all the data
//     const newTab = window.open('', '_blank');
//     newTab.document.write(`
//       <html>
//         <head>
//           <title>Medical Record - ${patient.name}</title>
//           <style>
//             body { 
//               font-family: Arial, sans-serif; 
//               padding: 20px; 
//               background-color: #f5f7fa;
//               margin: 0;
//             }
//             .header {
//               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//               color: white;
//               padding: 20px;
//               border-radius: 8px;
//               margin-bottom: 20px;
//               display: flex;
//               justify-content: space-between;
//               align-items: center;
//             }
//             .container {
//               max-width: 1200px;
//               margin: 0 auto;
//             }
//             .form-group { 
//               margin-bottom: 20px; 
//               background: white;
//               padding: 15px;
//               border-radius: 8px;
//               box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//             }
//             .two-columns {
//               display: grid;
//               grid-template-columns: 1fr 1fr;
//               gap: 20px;
//             }
//             h1 { margin: 0; }
//             h2 { 
//               margin-top: 0;
//               color: #4338ca;
//               border-bottom: 1px solid #e5e7eb;
//               padding-bottom: 10px;
//             }
//             label { 
//               display: block; 
//               margin-bottom: 8px; 
//               font-weight: bold;
//               color: #4b5563;
//             }
//             input, textarea { 
//               width: 100%; 
//               padding: 12px; 
//               border: 1px solid #e5e7eb; 
//               border-radius: 6px;
//               font-size: 16px;
//               box-sizing: border-box;
//             }
//             textarea {
//               min-height: 120px;
//             }
//             .buttons {
//               display: flex;
//               gap: 10px;
//               margin-top: 20px;
//             }
//             button { 
//               padding: 12px 24px; 
//               border: none; 
//               border-radius: 6px; 
//               cursor: pointer;
//               font-weight: bold;
//               font-size: 16px;
//             }
//             .save-btn { 
//               background: #10b981; 
//               color: white; 
//             }
//             .cancel-btn { 
//               background: #ef4444; 
//               color: white; 
//             }
//             .family-member {
//               background: #f3f4f6;
//               border-radius: 6px;
//               padding: 10px;
//               margin-bottom: 10px;
//             }
//             .current-patient {
//               background: #e0f2fe;
//               border: 1px solid #bae6fd;
//             }
//             .visit-history {
//               background: #f8fafc;
//               border-radius: 6px;
//               padding: 10px;
//               margin-bottom: 10px;
//               border-left: 4px solid #3b82f6;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <h1>📝 Medical Record - ${patient.name}</h1>
//             <button class="cancel-btn" onclick="window.close()">❌ Close</button>
//           </div>
//           <div class="container">
//             <div class="two-columns">
//               <!-- Left Column -->
//               <div>
//                 <div class="form-group">
//                   <h2>👤 Patient Information</h2>
//                   <p>Age: ${patient.age} | Gender: ${patient.gender || 'Not specified'}</p>
//                   <p>Phone: ${patient.phone_number || 'Not provided'}</p>
//                   <p>Relationship: ${patient.relationship || 'Self'}</p>
//                 </div>
                
//                 <div class="form-group">
//                   <h2>📋 Family Medical History</h2>
//                   <div id="familyHistory">
//                     ${familyData.family_summary && Object.keys(familyData.family_summary).length > 0 
//                       ? '<h3>Family Health Summary</h3><ul>' + 
//                         Object.entries(familyData.family_summary).map(([condition, count]) => 
//                           `<li><strong>${condition}:</strong> ${count} members</li>`
//                         ).join('') + '</ul>'
//                       : '<p>No family health summary available.</p>'
//                     }
//                   </div>
//                 </div>
                
//                 <div class="form-group">
//                   <h2>👨‍👩‍👧‍👦 Family Members Using This Phone</h2>
//                   <div id="familyMembers">
//                     ${familyData.family_members && familyData.family_members.length > 0
//                       ? familyData.family_members.map(member => {
//                           const isCurrentPatient = member.id === patient.id;
//                           return `<div class="family-member ${isCurrentPatient ? 'current-patient' : ''}">
//                             <p><strong>${member.name}</strong> (${member.relationship || 'Unknown'})</p>
//                             <p>Age: ${member.age} | Gender: ${member.gender || 'Not specified'}</p>
//                             ${isCurrentPatient ? '<p><em>Current Patient</em></p>' : ''}
//                           </div>`;
//                         }).join('')
//                       : '<p>No family members found.</p>'
//                     }
//                   </div>
//                 </div>
                
//                 <div class="form-group">
//                   <h2>🩺 Medical Visit History</h2>
//                   <div id="visitHistory">
//                     ${familyData.medical_history && familyData.medical_history.length > 0
//                       ? familyData.medical_history.map(visit => 
//                           `<div class="visit-history">
//                             <p><strong>Date:</strong> ${new Date(visit.updated_at).toLocaleDateString()}</p>
//                             <p><strong>Diagnosis:</strong> ${visit.diagnosis || 'None'}</p>
//                             <p><strong>Notes:</strong> ${visit.medical_notes || 'None'}</p>
//                             <p><strong>Prescriptions:</strong> ${visit.prescriptions || 'None'}</p>
//                           </div>`
//                         ).join('')
//                       : '<p>No previous visit history.</p>'
//                     }
//                   </div>
//                 </div>
//               </div>
              
//               <!-- Right Column -->
//               <div>
//                 <div class="form-group">
//                   <h2>🏥 Current Diagnosis</h2>
//                   <input type="text" id="diagnosis" value="${patient.diagnosis || ''}" />
//                 </div>
                
//                 <div class="form-group">
//                   <h2>📝 Medical Notes</h2>
//                   <textarea id="medical_notes">${patient.medical_notes || ''}</textarea>
//                 </div>
                
//                 <div class="form-group">
//                   <h2>💊 Prescriptions</h2>
//                   <textarea id="prescriptions">${patient.prescriptions || ''}</textarea>
//                 </div>
                
//                 <div class="form-group">
//                   <h2>📅 Appointment Information</h2>
//                   <label>Next Checkup Date:</label>
//                   <input type="date" id="next_appointment" value="${patient.next_appointment || ''}" />
//                 </div>
                
//                 <div class="buttons">
//                   <button type="button" class="save-btn" onclick="saveRecord()">💾 Save Record</button>
//                   <button type="button" class="cancel-btn" onclick="window.close()">❌ Cancel</button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <script>
//             function saveRecord() {
//               const data = {
//                 diagnosis: document.getElementById('diagnosis').value,
//                 medical_notes: document.getElementById('medical_notes').value,
//                 prescriptions: document.getElementById('prescriptions').value,
//                 next_appointment: document.getElementById('next_appointment').value
//               };
              
//               alert('Record saved successfully!');
//               window.close();
//             }
//           </script>
//         </body>
//       </html>
//     `);
//   } catch (error) {
//     console.error('Error fetching family data:', error);
//     alert('Error loading family data. Opening basic form...');
//     // Fallback to basic form if family data fetch fails
//     const newTab = window.open('', '_blank');
//     newTab.document.write('Basic medical record form...');
//   }
// }}
        ////❌⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️                    
                          >
                            {hasHistory ? '📚 View Family History & Update' : '✏️ Add First Medical Record'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Enhanced Edit Modal with Family History */}
        {showEditModal && editingPatient && (
          <div className="modal-overlay">
            <div className="modal-content family-modal">
              <div className="modal-header">
                <div className="patient-info-header">
                  <h2 className="modal-title">
                    🩺 Medical Record - {getRelationshipEmoji(editingPatient.relationship)} {editingPatient.name}
                  </h2>
                  <div className="patient-status">
                    {familySummary.has_history ? (
                      <span className="status-badge family-history">
                        👨‍👩‍👧‍👦 Family History ({familySummary.total_visits} total visits)
                      </span>
                    ) : (
                      <span className="status-badge new-family">
                        ✨ New Family (First Visit)
                      </span>
                    )}
                  </div>
                </div>
                <p className="modal-subtitle">
                  📞 Phone: {editingPatient.phone_number} | 👥 Relationship: {getRelationshipDisplay(editingPatient.relationship)} | 
                  👤 Age: {editingPatient.age} | Gender: {editingPatient.gender}
                </p>
                {/* <button 
                  className="modal-close"
                  onClick={handleCloseModal}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ✕
                </button> */}
                <button 
              className="modal-close"
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                color: '#ef4444',
                zIndex: 1001
              }}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                {/* Family History Section */}
                <div className="history-section">
                  <h3 className="section-title">
                    👨‍👩‍👧‍👦 Family Medical History 
                    {familySummary.has_history && (
                      <span className="visit-count">
                        ({familySummary.unique_members} members, {familySummary.total_visits} visits)
                      </span>
                    )}
                  </h3>
                  
                  {loadingHistory ? (
                    <div className="loading-history">🔄 Loading family history...</div>
                  ) : (
                    <>
                      {/* Family Members Summary */}
                      {familyMembers.length > 1 && (
                        <div className="family-members-section">
                          <h4 className="subsection-title">👥 Family Members Using This Phone</h4>
                          <div className="family-members-grid">
                            {familyMembers.map((member, index) => (
                              <div key={member.id} className={`family-member-card ${member.id === editingPatient.id ? 'current-patient' : ''}`}>
                                <div className="member-info">
                                  <span className="member-name">
                                    {getRelationshipEmoji(member.relationship)} {member.name}
                                  </span>
                                  <span className="member-details">
                                    {getRelationshipDisplay(member.relationship)} | Age: {member.age}
                                  </span>
                                  {member.id === editingPatient.id && (
                                    <span className="current-badge">Current Patient</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Medical Visit History */}
                      {familyHistory.length > 0 ? (
                        <div className="history-list">
                          <h4 className="subsection-title">🩺 Medical Visit History</h4>
                          {familyHistory.map((history, index) => (
                            <div key={history.id || index} className="history-item">
                              <div className="history-header">
                                <div className="visit-info">
                                  <span className="visit-date">
                                    🗓️ {new Date(history.visit_date).toLocaleDateString()} 
                                    {new Date(history.visit_date).toDateString() === new Date().toDateString() && 
                                      <span className="today-badge">Today</span>
                                    }
                                  </span>
                                  <span className="patient-info">
                                    {getRelationshipEmoji(history.relationship)} {history.patient_name} 
                                    ({getRelationshipDisplay(history.relationship)}, Age: {history.age})
                                  </span>
                                </div>
                                <span className="doctor-name">
                                  👨‍⚕️ {history.doctor_name}
                                </span>
                              </div>
                              <div className="history-details">
                                {history.diagnosis && (
                                  <p><strong>🏥 Diagnosis:</strong> {history.diagnosis}</p>
                                )}
                                {history.medical_notes && (
                                  <p><strong>📝 Notes:</strong> {history.medical_notes}</p>
                                )}
                                {history.prescriptions && (
                                  <p><strong>💊 Prescriptions:</strong> {history.prescriptions}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-history">
                          <div className="no-history-icon">📝</div>
                          <p>No previous medical history found for this phone number.</p>
                          <p>This will be the first medical record for this family.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Current Update Form */}
                <div className="update-section">
                  <h3 className="section-title">
                    🩺 Current Visit - {getRelationshipEmoji(editingPatient.relationship)} {editingPatient.name}
                    <span className="patient-relationship">({getRelationshipDisplay(editingPatient.relationship)})</span>
                  </h3>
                  <form onSubmit={updatePatient}>
                    <div className="form-group">
                      <label className="form-label">
                        🏥 Current Diagnosis *
                        <span className="helper-text">What is the current medical condition or complaint?</span>
                      </label>
                      <textarea
                        name="diagnosis"
                        className="form-input"
                        value={editingPatient.diagnosis || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., Cough, Cold, Fever, Headache..."
                        rows="3"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        📝 Medical Notes
                        <span className="helper-text">Detailed observations, symptoms, examination findings</span>
                      </label>
                      <textarea
                        name="medical_notes"
                        className="form-input"
                        value={editingPatient.medical_notes || ''}
                        onChange={handleInputChange}
                        placeholder="Enter detailed medical notes, observations, symptoms, examination findings..."
                        rows="4"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        💊 Prescriptions
                        <span className="helper-text">Medications with dosage and frequency</span>
                      </label>
                      <textarea
                        name="prescriptions"
                        className="form-input"
                        value={editingPatient.prescriptions || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., Paracetamol 500mg - 2 times daily after meals&#10;Amoxicillin 250mg - 3 times daily for 7 days"
                        rows="3"
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">📅 Checkup Date</label>
                        <input
                          type="date"
                          name="last_checkup"
                          className="form-input"
                          value={editingPatient.last_checkup || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">🗓️ Next Appointment</label>
                        <input
                          type="date"
                          name="next_appointment"
                          className="form-input"
                          value={editingPatient.next_appointment || ''}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn btn-cancel"
                        onClick={handleCloseModal}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-submit"
                        disabled={saving}
                      >
                        {saving ? '💾 Saving...' : '💾 Save Medical Record'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Styles */}
      <style jsx>{`
        .family-modal .modal-content {
          max-width: 1300px;
          max-height: 97vh;
          overflow-y: auto;
          position: relative;
        //   max-width: 98vw;    // Almost full viewport width
        // max-height: 98vh;   // Almost full viewport height
        // width: 98vw;        // Add this line
        // height: 98vh;       // Add this line
        // overflow-y: auto;
        // position: relative;
        }

        .patient-info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .patient-status {
          display: flex;
          gap: 8px;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.family-history {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-badge.new-family {
          background: #dcfce7;
          color: #166534;
        }

        .returning-patient {
          border-left: 4px solid #3b82f6;
        }

        .new-patient {
          border-left: 4px solid #10b981;
        }

        .patient-badges {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .relationship-badge {
          background: #f3e8ff;
          color: #7c3aed;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .returning-badge {
          background: #dbeafe;
          color: #1e40af;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .relationship-info {
          background: #f3e8ff;
          color: #7c3aed;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 500;
        }

        .history-indicator {
          background: #f0f9ff;
          color: #0369a1;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 500;
        }

        .modal-body {
          display: flex;
          gap: 30px;
          padding: 20px;
        }

        .history-section {
          flex: 1.3;
          border-right: 1px solid #e5e7eb;
          padding-right: 20px;
        }

        .update-section {
          flex: 1;
          padding-left: 20px;
        }

        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 16px;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .visit-count {
          font-size: 14px;
          color: #6b7280;
          font-weight: normal;
        }

        .patient-relationship {
          font-size: 14px;
          color: #7c3aed;
          font-weight: normal;
        }

        .subsection-title {
          font-size: 16px;
          font-weight: 600;
          margin: 16px 0 12px 0;
          color: #4b5563;
        }

        .loading-history {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }

        .family-members-section {
          margin-bottom: 24px;
        }

        .family-members-grid {
          display: grid;
          gap: 8px;
          margin-bottom: 16px;
        }

        .family-member-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px;
        }

        .current-patient {
          background: #dbeafe;
          border-color: #3b82f6;
        }

        .member-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .member-name {
          font-weight: 600;
          color: #374151;
        }

        .member-details {
          font-size: 12px;
          color: #6b7280;
        }

        .current-badge {
          background: #3b82f6;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
        }

        .history-list {
          max-height: 500px;
          overflow-y: auto;
        }

        .history-item {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .visit-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .patient-info {
          font-weight: 500;
          color: #374151;
        }

        .today-badge {
          background: #fef3c7;
          color: #92400e;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 10px;
          margin-left: 8px;
        }

        .history-details p {
          margin: 6px 0;
          font-size: 14px;
          line-height: 1.4;
        }

        .no-history {
          text-align: center;
          padding: 40px;
          background: #f9fafb;
          border-radius: 8px;
          border: 2px dashed #d1d5db;
        }

        .no-history-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .no-history p {
          color: #6b7280;
          margin: 8px 0;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .form-row .form-group {
          flex: 1;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .helper-text {
          display: block;
          font-size: 12px;
          color: #6b7280;
          font-weight: normal;
          margin-top: 2px;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .btn-submit {
          background: #3b82f6;
          color: white;
        }

        .btn-submit:hover:not(:disabled) {
          background: #2563eb;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card.orange {
          background: linear-gradient(135deg, #fed7aa 0%, #fb923c 100%);
          color: white;
        }
      `}</style>
    </div>
  );
}