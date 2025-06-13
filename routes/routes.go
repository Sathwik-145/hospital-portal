package routes

import (
    "github.com/gin-gonic/gin"
    "github.com/Sathwik-145/hospital-portal/controllers"
    "github.com/Sathwik-145/hospital-portal/middleware"
)

func SetupRoutes(router *gin.Engine) {
    // Auth routes (no middleware needed)
    auth := router.Group("/auth")
    {
        auth.POST("/register", controllers.RegisterUser) // Updated to use RegisterUser
        auth.POST("/login", controllers.LoginUser)      // Updated to use LoginUser
    }

    // Protected API routes
    api := router.Group("/api")
    api.Use(middleware.AuthMiddleware("receptionist", "doctor"))
    {
        // Patient CRUD routes
        api.GET("/patients", controllers.GetAllPatients)
        api.POST("/patients", controllers.CreatePatient)
        api.PUT("/patients/:id", controllers.UpdatePatient)
        api.DELETE("/patients/:id", controllers.DeletePatient)
        
        // Individual patient routes
        api.GET("/patients/:id", controllers.GetPatient)
        api.GET("/patients/:id/history", controllers.GetPatientHistory)
        
        // Family history route (by phone number)
        api.GET("/patients/phone/:phone/family-history", controllers.GetFamilyHistoryByPhone)
    }
}