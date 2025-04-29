package models

import "time"

type ModelLog struct {
	ID         uint      `gorm:"primaryKey"`
	UserID     uint
	ModelName  string
	Epochs     int
	Accuracy   float64
	UsedInBlock bool
	CreatedAt  time.Time
}
