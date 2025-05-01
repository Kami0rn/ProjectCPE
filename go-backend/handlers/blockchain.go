package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/Kami0rn/ProjectCPE/go-backend/blockchain"
	"github.com/dgrijalva/jwt-go"
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

func hashFile(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hasher := sha256.New()
	if _, err := io.Copy(hasher, file); err != nil {
		return "", err
	}

	return hex.EncodeToString(hasher.Sum(nil)), nil
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
	// Extract the token from the Authorization header
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token is required"})
		return
	}

	// Remove the "Bearer " prefix from the token string
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	tokenString = strings.TrimSpace(tokenString)

	// Parse and validate the token
	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	// Extract the username from the token claims
	username, ok := claims["username"].(string)
	if !ok || username == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token: username not found"})
		return
	}

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

	// Retrieve model_name
	modelName := c.PostForm("model_name")
	if modelName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Model name is required"})
		return
	}

	epochs := c.PostForm("epochs")
	if epochs == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Epochs parameter is required"})
		return
	}

	// Save all uploaded files temporarily in the user's folder structure
	basePath := "./user_data/" + username + "/" + modelName + "/uploaded_images"
	if err := os.MkdirAll(basePath, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create directories"})
		return
	}

	tempFilePaths := []string{}
	for _, file := range files {
		tempFilePath := basePath + "/" + file.Filename
		if err := c.SaveUploadedFile(file, tempFilePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image file"})
			return
		}
		tempFilePaths = append(tempFilePaths, tempFilePath)
	}

	// Compute the hash of each uploaded image and add it as a transaction
	for _, filePath := range tempFilePaths {
		hash, err := hashFile(filePath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash image file"})
			return
		}

		// Add the hash as a transaction
		tx := blockchain.Transaction{
			Sender:    username,
			Receiver:  "blockchain",
			Amount:    0, // No monetary value, just storing the hash
			ImageHash: hash,
		}
		pendingTransactions = append(pendingTransactions, tx)
	}

	// Request AI proof from the Python module
	aiProof, err := blockchain.RequestAIProof(tempFilePaths, epochs, username, modelName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get AI proof"})
		return
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

func CheckImage(c *gin.Context) {
	// Parse the uploaded image
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image provided"})
		return
	}

	// Save the uploaded image temporarily
	tempFilePath := "./temp_uploaded_image"
	if err := c.SaveUploadedFile(file, tempFilePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
		return
	}
	defer os.Remove(tempFilePath) // Clean up the temporary file

	// Compute the hash of the uploaded image
	imageHash, err := hashFile(tempFilePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to compute image hash"})
		return
	}

	// Collect all matches for the image hash
	matches := []gin.H{}
	for _, block := range blockchain.Blockchain {
		for _, tx := range block.Transactions {
			if tx.ImageHash == imageHash {
				matches = append(matches, gin.H{
					"block_index": block.Index,
					"timestamp":   block.Timestamp,
				})
			}
		}
	}

	// Return the results
	if len(matches) > 0 {
		c.JSON(http.StatusOK, gin.H{
			"trained": true,
			"matches": matches,
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"trained": false,
		})
	}
}
