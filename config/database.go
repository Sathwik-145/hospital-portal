package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"github.com/Sathwik-145/hospital-portal/models"
)

var DB *gorm.DB

func ConnectDatabase() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := os.Getenv("DB_URL")
	// ✅ Define the db variable here
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// ✅ Use db here (not undefined)
	err = db.AutoMigrate(&models.User{}, &models.Patient{})
	if err != nil {
		log.Fatal("Failed to auto-migrate:", err)
	}

	DB = db
}
