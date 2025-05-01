package models

import "time"

type Model struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Name      string    `json:"name"`        // Model name
    CreatedBy string    `json:"created_by"`  // Username of the creator
    CreatedAt time.Time `json:"created_at"`  // Timestamp of creation
    Hash      string    `json:"hash"`        // Hash of the block
}