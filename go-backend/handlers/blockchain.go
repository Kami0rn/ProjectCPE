package handlers

import (
	"net/http"
	"time"

	"github.com/Kami0rn/ProjectCPE/go-backend/blockchain"
	"github.com/gin-gonic/gin"
)

var pendingTransactions []blockchain.Transaction

// Get the current blockchain
func GetChain(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"length": len(blockchain.Blockchain),
		"chain":  blockchain.Blockchain,
	})
}

// Add a transaction to the pending pool
func AddTransaction(c *gin.Context) {
	var tx blockchain.Transaction
	if err := c.ShouldBindJSON(&tx); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction"})
		return
	}
	pendingTransactions = append(pendingTransactions, tx)
	c.JSON(http.StatusCreated, gin.H{"message": "Transaction added"})
}

// Mine a new block (simulate work for now)
func MineBlock(c *gin.Context) {
	lastBlock := blockchain.Blockchain[len(blockchain.Blockchain)-1]

	newBlock := blockchain.Block{
		Index:        lastBlock.Index + 1,
		Timestamp:    time.Now(),
		Transactions: pendingTransactions,
		PrevHash:     lastBlock.Hash,
		Proof:        "simulated_proof", // later will be WGAN proof
	}
	newBlock.Hash = blockchain.CalculateHash(newBlock)

	blockchain.AddBlock(newBlock)
	pendingTransactions = nil

	c.JSON(http.StatusCreated, newBlock)
}
