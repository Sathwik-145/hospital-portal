import { useEffect, useState } from 'react';

export default function PatientDashboard() {
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [disease, setDisease] = useState('');
  const [editingPatientId, setEditingPatientId] = useState(null);
  const token = localStorage.getItem('token');

  const fetchPatients = async () => {
    const res = await fetch('http://localhost:8080/api/patients', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPatients(data);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (typeof name !== 'string' || typeof age !== 'string') {
      alert("Name and Age must be valid strings.");
      return;
    }

    if (!name.trim() || !age.trim()) {
      alert("Name and Age are required!");
      return;
    }

    const patientData = {
      name: name.trim(),
      age: parseInt(age),
      disease: disease?.trim() || '',
    };

    try {
      if (editingPatientId) {
        const res = await fetch(`http://localhost:8080/api/patients/${editingPatientId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(patientData),
        });

        if (res.ok) {
          alert("✅ Patient updated");
          await fetchPatients();
        } else {
          alert('❌ Failed to update patient');
        }
      } else {
        const res = await fetch('http://localhost:8080/api/patients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(patientData),
        });

        if (res.ok) {
          alert("✅ Patient added");
          await fetchPatients();
        } else {
          alert('❌ Failed to add patient');
        }
      }
    } catch (error) {
      alert('❌ Network error');
    }

    setShowForm(false);
    setEditingPatientId(null);
    setName('');
    setAge('');
    setDisease('');
  };

  const handleEdit = (patient) => {
    setEditingPatientId(patient.id);
    setName(patient.name || '');
    setAge(String(patient.age) || '');
    setDisease(patient.disease || '');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/patients/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("🗑️ Patient deleted");
        await fetchPatients();
      } else {
        alert("❌ Failed to delete patient");
      }
    } catch (error) {
      alert("❌ Network error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Patient Dashboard</h1>

      <button
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => {
          setShowForm(!showForm);
          setEditingPatientId(null);
          setName('');
          setAge('');
          setDisease('');
        }}
      >
        {showForm ? 'Cancel' : 'Add Patient'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
          <input
            type="text"
            placeholder="Name"
            className="block w-full mb-2 p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Age"
            className="block w-full mb-2 p-2 border rounded"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Disease"
            className="block w-full mb-2 p-2 border rounded"
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            {editingPatientId ? 'Update' : 'Submit'}
          </button>
        </form>
      )}

      <div className="bg-white shadow p-4 rounded">
        {patients.length === 0 ? (
          <p>No patients found.</p>
        ) : (
          <ul>
            {patients.map((p) => (
              <li key={p.id} className="border-b py-2 flex justify-between items-center">
                <span>
                  <strong>{p.name}</strong> - Age: {p.age}, Disease: {p.disease || 'N/A'}
                </span>
                <div className="flex">
                  <button
                    onClick={() => handleEdit(p)}
                    className="ml-2 px-2 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="ml-2 px-2 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
