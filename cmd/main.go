package main

import (
    "fmt"
    "time"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"

    "github.com/Sathwik-145/hospital-portal/config"
    "github.com/Sathwik-145/hospital-portal/models"
    "github.com/Sathwik-145/hospital-portal/routes"
)

func main() {
    // Connect to DB
    config.ConnectDatabase()

    // Run database migration - Add this after connecting to database
    fmt.Println("🔄 Running database migrations...")
    if err := config.DB.AutoMigrate(&models.Patient{}, &models.MedicalHistory{}, &models.User{}); err != nil {
        fmt.Println("❌ Migration failed:", err)
        return
    }
    fmt.Println("✅ Database migration completed")
	

    router := gin.Default()

    // Add Logger Middleware (helps debug)
    router.Use(gin.Logger())

    // Enable CORS (Frontend @ 3000)
    router.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))

    fmt.Println("✅ Setting up routes...")

    // Register your routes
    routes.SetupRoutes(router)

    // Start server
    fmt.Println("🚀 Starting server on port 8080...")
    if err := router.Run(":8080"); err != nil {
        fmt.Println("❌ Server failed to start:", err)
    } else {
        fmt.Println("✅ Server running at http://localhost:8080")
    }
}