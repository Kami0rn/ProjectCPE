package handlers

import (
	"net/http"
	"os"
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

// Mine a new block
func MineBlock(c *gin.Context) {
	// Parse the multipart form data
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form data"})
		return
	}

	// Retrieve all uploaded files
	files := form.File["images"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No images provided"})
		return
	}

	epochs := c.PostForm("epochs")
	if epochs == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Epochs parameter is required"})
		return
	}

	// Save all uploaded files temporarily
	tempFilePaths := []string{}
	for _, file := range files {
		tempFilePath := "./" + file.Filename
		if err := c.SaveUploadedFile(file, tempFilePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image file"})
			return
		}
		tempFilePaths = append(tempFilePaths, tempFilePath)
	}

	// Request AI proof from the Python module
	aiProof, err := blockchain.RequestAIProof(tempFilePaths, epochs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get AI proof"})
		return
	}

	// Clean up the temporary files
	for _, tempFilePath := range tempFilePaths {
		os.Remove(tempFilePath)
	}

	// Get the last block in the blockchain
	lastBlock := blockchain.Blockchain[len(blockchain.Blockchain)-1]

	// Create a new block
	newBlock := blockchain.Block{
		Index:        lastBlock.Index + 1,
		Timestamp:    time.Now(),
		Transactions: pendingTransactions,
		PrevHash:     lastBlock.Hash,
		Proof:        aiProof,
	}
	newBlock.Hash = blockchain.CalculateHash(newBlock)

	// Validate the new block
	if !blockchain.IsBlockValid(newBlock, lastBlock) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid block"})
		return
	}

	// Add the new block to the blockchain
	blockchain.AddBlock(newBlock)
	pendingTransactions = nil

	c.JSON(http.StatusCreated, newBlock)
}
