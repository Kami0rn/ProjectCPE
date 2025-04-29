package blockchain

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
)

func CalculateHash(block Block) string {
	blockBytes, _ := json.Marshal(block)
	hash := sha256.Sum256(blockBytes)
	return hex.EncodeToString(hash[:])
}
