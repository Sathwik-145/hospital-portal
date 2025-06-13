package repository

import (
    "time"
    "github.com/Sathwik-145/hospital-portal/models"
    "github.com/Sathwik-145/hospital-portal/config"
)

func CreatePatient(p models.Patient) error {
    return config.DB.Create(&p).Error
}

func GetAllPatients() ([]models.Patient, error) {
    var patients []models.Patient
    err := config.DB.Preload("MedicalHistory").Find(&patients).Error
    return patients, err
}

func UpdatePatient(id int, updated models.Patient) error {
    var patient models.Patient
    
    // Get existing patient
    if err := config.DB.First(&patient, id).Error; err != nil {
        return err
    }

    // Store previous state as medical history if there are medical changes
    if (patient.Diagnosis != updated.Diagnosis && updated.Diagnosis != "") || 
       (patient.MedicalNotes != updated.MedicalNotes && updated.MedicalNotes != "") || 
       (patient.Prescriptions != updated.Prescriptions && updated.Prescriptions != "") {
        
        // Create medical history entry with complete patient info
        history := models.MedicalHistory{
            PatientID:     patient.ID,
            PatientName:   patient.Name,
            PhoneNumber:   patient.PhoneNumber,
            Relationship:  patient.Relationship,
            Age:           patient.Age,
            Gender:        patient.Gender,
            DoctorName:    "Dr. Current", // You can get this from JWT token later
            VisitDate:     time.Now(),
            Diagnosis:     updated.Diagnosis,
            MedicalNotes:  updated.MedicalNotes,
            Prescriptions: updated.Prescriptions,
            CreatedAt:     time.Now(),
        }
        
        // Save to medical history
        config.DB.Create(&history)
    }

    // Update patient fields (including relationship if changed)
    patient.Name = updated.Name
    patient.Age = updated.Age
    patient.Gender = updated.Gender
    patient.PhoneNumber = updated.PhoneNumber
    patient.Relationship = updated.Relationship
    patient.Diagnosis = updated.Diagnosis
    patient.MedicalNotes = updated.MedicalNotes
    patient.Prescriptions = updated.Prescriptions
    patient.LastCheckup = updated.LastCheckup
    patient.NextAppointment = updated.NextAppointment
    patient.UpdatedAt = time.Now()

    return config.DB.Save(&patient).Error
}

func DeletePatient(id int) error {
    // First delete all medical history records
    config.DB.Where("patient_id = ?", id).Delete(&models.MedicalHistory{})
    // Then delete the patient
    return config.DB.Delete(&models.Patient{}, id).Error
}

func GetPatientByNameAndAge(name string, age int) (models.Patient, error) {
    var p models.Patient
    err := config.DB.Preload("MedicalHistory").Where("name = ? AND age = ?", name, age).Order("id DESC").First(&p).Error
    return p, err
}

func GetPatientByID(id int) (models.Patient, error) {
    var p models.Patient
    err := config.DB.Preload("MedicalHistory").First(&p, id).Error
    return p, err
}

func GetPatientWithHistory(id int) (models.Patient, error) {
    var patient models.Patient
    err := config.DB.Preload("MedicalHistory").First(&patient, id).Error
    return patient, err
}

// Enhanced function: Get complete family medical history by phone number
func GetFamilyHistoryByPhone(phoneNumber string) ([]models.MedicalHistory, error) {
    var history []models.MedicalHistory
    err := config.DB.Where("phone_number = ?", phoneNumber).Order("visit_date DESC").Find(&history).Error
    return history, err
}

// Enhanced function: Get all family members with same phone number
func GetFamilyMembersByPhone(phoneNumber string) ([]models.Patient, error) {
    var patients []models.Patient
    err := config.DB.Where("phone_number = ?", phoneNumber).Order("created_at DESC").Find(&patients).Error
    return patients, err
}

// Enhanced function: Check family visit history
func GetFamilyVisitSummary(phoneNumber string) (map[string]interface{}, error) {
    var totalVisits int64
    var uniqueMembers int64
    
    // Count total visits
    config.DB.Model(&models.MedicalHistory{}).Where("phone_number = ?", phoneNumber).Count(&totalVisits)
    
    // Count unique family members
    config.DB.Model(&models.Patient{}).Where("phone_number = ?", phoneNumber).Count(&uniqueMembers)
    
    // Get relationship breakdown
    var relationshipCounts []struct {
        Relationship string
        Count        int64
    }
    config.DB.Model(&models.Patient{}).
        Select("relationship, count(*) as count").
        Where("phone_number = ?", phoneNumber).
        Group("relationship").
        Scan(&relationshipCounts)
    
    return map[string]interface{}{
        "total_visits":        totalVisits,
        "unique_members":      uniqueMembers,
        "relationship_counts": relationshipCounts,
        "has_history":         totalVisits > 0,
    }, nil
}

func GetAllPatientsWithHistory() ([]models.Patient, error) {
    var patients []models.Patient
    err := config.DB.Preload("MedicalHistory").Find(&patients).Error
    return patients, err
}