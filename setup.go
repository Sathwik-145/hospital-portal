package main

import (
	"fmt"
	"os"
)

var folders = []string{
	"cmd",
	"config",
	"controllers",
	"models",
	"repository",
	"routes",
	"services",
	"middleware",
	"utils",
	"migrations",
	"docs",
	"test",
}

var files = map[string]string{
	"cmd/main.go":                 "package main\n\nfunc main() {\n\t// Entry point\n}\n",
	".env":                        "# Add your environment variables here\nDB_URL=\nJWT_SECRET=\n",
	"README.md":                   "# Hospital Portal\n\nBackend Golang app for doctors & receptionists",
	"go.mod":                      "",
	"controllers/patient.go":      "package controllers\n\n// Add patient handlers here",
	"controllers/auth.go":         "package controllers\n\n// Add auth handlers here",
	"models/patient.go":           "package models\n\n// Add patient model here",
	"models/user.go":              "package models\n\n// Add user model here",
	"repository/patient.go":       "package repository\n\n// Add patient DB logic here",
	"routes/routes.go":            "package routes\n\n// Setup Gin routes here",
	"services/auth.go":            "package services\n\n// Add auth service logic here",
	"middleware/auth.go":          "package middleware\n\n// JWT Middleware goes here",
}

func main() {
	for _, folder := range folders {
		err := os.MkdirAll(folder, os.ModePerm)
		if err != nil {
			fmt.Printf("Error creating folder %s: %v\n", folder, err)
			continue
		}
		fmt.Println("Created folder:", folder)
	}

	for path, content := range files {
		err := os.WriteFile(path, []byte(content), 0644)
		if err != nil {
			fmt.Printf("Error creating file %s: %v\n", path, err)
			continue
		}
		fmt.Println("Created file:", path)
	}
}
