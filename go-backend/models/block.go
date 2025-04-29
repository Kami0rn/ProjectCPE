package models

import "time"

type Block struct {
	ID           uint      `gorm:"primaryKey"`
	Index        int
	Timestamp    time.Time
	PrevHash     string
	Hash         string
	Nonce        string
	ModelHash    string // hash of model training result
	TrainedBy    string // user who trained
}
