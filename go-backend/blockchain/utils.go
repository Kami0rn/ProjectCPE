package blockchain

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
)

func CalculateHash(block Block) string {
	// Clone block with Hash emptied
	temp := block
	temp.Hash = ""

	blockBytes, _ := json.Marshal(temp)
	hash := sha256.Sum256(blockBytes)
	return hex.EncodeToString(hash[:])
}

func IsBlockValid(newBlock, prevBlock Block) bool {
	// 1. Check index
	if newBlock.Index != prevBlock.Index+1 {
		return false
	}

	// 2. Check previous hash
	if newBlock.PrevHash != prevBlock.Hash {
		return false
	}

	// 3. Recalculate the hash and compare
	expectedHash := CalculateHash(newBlock)
	if newBlock.Hash != expectedHash {
		return false
	}

	return true
}
