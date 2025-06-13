package services

import (
	"errors"

	"github.com/Sathwik-145/hospital-portal/models"
	"github.com/Sathwik-145/hospital-portal/config"
	"golang.org/x/crypto/bcrypt"
)

func AuthenticateUser(email, password string) (*models.User, error) {
	var user models.User
	result := config.DB.Where("email = ?", email).First(&user)
	if result.Error != nil {
		return nil, errors.New("invalid email or password")
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	return &user, nil
}
