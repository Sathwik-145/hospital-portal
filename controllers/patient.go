package controllers

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
    "github.com/Sathwik-145/hospital-portal/models"
    "github.com/Sathwik-145/hospital-portal/repository"
)

// CreatePatient - Only receptionists can create patients
func CreatePatient(c *gin.Context) {
    role := c.MustGet("role").(string)
    if role != "receptionist" {
        c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: only receptionists can create patients"})
        return
    }

    var p models.Patient
    if err := c.ShouldBindJSON(&p); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    // Set default relationship if not provided
    if p.Relationship == "" {
        p.Relationship = "self"
    }

    if err := repository.CreatePatient(p); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create patient"})
        return
    }

    created, err := repository.GetPatientByNameAndAge(p.Name, p.Age)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Patient created but failed to fetch data"})
        return
    }

    c.JSON(http.StatusCreated, created)
}

// GetAllPatients - Receptionists and doctors can view all patients
func GetAllPatients(c *gin.Context) {
    role := c.MustGet("role").(string)
    if role != "receptionist" && role != "doctor" {
        c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: only receptionists or doctors can view patients"})
        return
    }

    patients, err := repository.GetAllPatients()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch patients"})
        return
    }

    c.JSON(http.StatusOK, patients)
}

// UpdatePatient - Receptionists and doctors can update patient info
func UpdatePatient(c *gin.Context) {
    role := c.MustGet("role").(string)
    if role != "receptionist" && role != "doctor" {
        c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: only receptionists or doctors can update patients"})
        return
    }

    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
        return
    }

    var p models.Patient
    if err := c.ShouldBindJSON(&p); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    // Set the ID for the update
    p.ID = uint(id)

    if err := repository.UpdatePatient(id, p); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update patient"})
        return
    }

    updated, err := repository.GetPatientByID(id)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Updated patient but fetch failed"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Patient updated successfully",
        "patient": updated,
    })
}

// DeletePatient - Only receptionists can delete patients
func DeletePatient(c *gin.Context) {
    role := c.MustGet("role").(string)
    if role != "receptionist" {
        c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: only receptionists can delete patients"})
        return
    }

    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
        return
    }

    if err := repository.DeletePatient(id); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete patient"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Patient deleted successfully"})
}

// GetPatientHistory - Get patient with medical history
func GetPatientHistory(c *gin.Context) {
    role := c.MustGet("role").(string)
    if role != "receptionist" && role != "doctor" {
        c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: only receptionists or doctors can view patient history"})
        return
    }

    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
        return
    }

    patient, err := repository.GetPatientWithHistory(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
        return
    }

    c.JSON(http.StatusOK, patient)
}

// GetFamilyHistoryByPhone - Get complete family medical history by phone number
func GetFamilyHistoryByPhone(c *gin.Context) {
    role := c.MustGet("role").(string)
    if role != "receptionist" && role != "doctor" {
        c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: only receptionists or doctors can view patient history"})
        return
    }

    phoneNumber := c.Param("phone")
    if phoneNumber == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Phone number is required"})
        return
    }

    // Get complete family history by phone number
    history, err := repository.GetFamilyHistoryByPhone(phoneNumber)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch family history"})
        return
    }

    // Get all family members with this phone number
    familyMembers, err := repository.GetFamilyMembersByPhone(phoneNumber)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch family members"})
        return
    }

    // Get family visit summary
    summary, err := repository.GetFamilyVisitSummary(phoneNumber)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get family summary"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "phone_number":     phoneNumber,
        "family_summary":   summary,
        "medical_history":  history,
        "family_members":   familyMembers,
    })
}

// GetPatient - Get single patient by ID
func GetPatient(c *gin.Context) {
    role := c.MustGet("role").(string)
    if role != "receptionist" && role != "doctor" {
        c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: only receptionists or doctors can view patients"})
        return
    }

    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
        return
    }

    patient, err := repository.GetPatientByID(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
        return
    }

    c.JSON(http.StatusOK, patient)
}