package models

import (
    "time"

    "gorm.io/gorm"
)

type User struct {
	gorm.Model
    ID           uint      `gorm:"primaryKey"`
    Username     string    `gorm:"unique;not null"`
    PasswordHash string    `gorm:"not null"`
    Email        string    `gorm:"unique"` // Optional: Add email field
    CreatedAt    time.Time
}