package utils

import (
	"time"
	"github.com/dgrijalva/jwt-go"
	"github.com/Sathwik-145/hospital-portal/models"
)

var jwtKey = []byte("your-secret-key")

func GenerateJWT(user models.User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	})
	return token.SignedString(jwtKey)
}
