package models

import "time"

type Patient struct {
    ID              uint             `json:"id" gorm:"primaryKey"`
    Name            string           `json:"name"`
    Age             int              `json:"age"`
    Gender          string           `json:"gender"`
    Diagnosis       string           `json:"diagnosis"`
    PhoneNumber     string           `json:"phone_number"`
    // New relationship field
    Relationship    string           `json:"relationship"`     // self, son, daughter, mother, father, spouse, etc.
    // Medical fields for doctor updates
    MedicalNotes    string           `json:"medical_notes"`
    Prescriptions   string           `json:"prescriptions"`
    LastCheckup     string           `json:"last_checkup"`
    NextAppointment string           `json:"next_appointment"`
    // Relationship with medical history
    MedicalHistory  []MedicalHistory `json:"medical_history" gorm:"foreignKey:PatientID"`
    // Timestamps
    CreatedAt       time.Time        `json:"created_at"`
    UpdatedAt       time.Time        `json:"updated_at"`
}

type MedicalHistory struct {
    ID            uint      `json:"id" gorm:"primaryKey"`
    PatientID     uint      `json:"patient_id"`
    PatientName   string    `json:"patient_name"`
    PhoneNumber   string    `json:"phone_number"`
    Relationship  string    `json:"relationship"`      // Added relationship tracking
    Age           int       `json:"age"`               // Added age at time of visit
    Gender        string    `json:"gender"`            // Added gender
    DoctorName    string    `json:"doctor_name"`
    VisitDate     time.Time `json:"visit_date"`
    Diagnosis     string    `json:"diagnosis"`
    MedicalNotes  string    `json:"medical_notes"`
    Prescriptions string    `json:"prescriptions"`
    CreatedAt     time.Time `json:"created_at"`
}