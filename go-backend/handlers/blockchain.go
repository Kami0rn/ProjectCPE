package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"log"

	"github.com/Kami0rn/ProjectCPE/go-backend/blockchain"
	"github.com/Kami0rn/ProjectCPE/go-backend/database"
	"github.com/Kami0rn/ProjectCPE/go-backend/models"
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

	// Broadcast the new block to peers
	blockchain.BroadcastBlock(newBlock)

	// Save the model information in the database
	model := models.Model{
		Name:      modelName,
		CreatedBy: username,
		CreatedAt: time.Now(),
		Hash:      newBlock.Hash,
	}
	if err := database.DB.Create(&model).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save model to database"})
		return
	}

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

func ReceiveBlock(c *gin.Context) {
	var block blockchain.Block
	if err := c.ShouldBindJSON(&block); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid block data"})
		return
	}

	// Validate the block
	lastBlock := blockchain.Blockchain[len(blockchain.Blockchain)-1]
	if !blockchain.IsBlockValid(block, lastBlock) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid block"})
		return
	}

	// Add the block to the blockchain
	blockchain.AddBlock(block)
	c.JSON(http.StatusOK, gin.H{"message": "Block added successfully"})
}

func AddPeer(c *gin.Context) {
	var request struct {
		Peer string `json:"peer" binding:"required"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid peer data"})
		return
	}

	blockchain.AddPeer(request.Peer)
	c.JSON(http.StatusOK, gin.H{"message": "Peer added successfully"})
}

func SynchronizeBlockchain() {
	peers := blockchain.GetPeers()
	for _, peer := range peers {
		resp, err := http.Get("http://" + peer + "/api/chain")
		if err != nil {
			log.Printf("Failed to fetch chain from peer %s: %v", peer, err)
			continue
		}
		defer resp.Body.Close()

		var response struct {
			Chain []blockchain.Block `json:"chain"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
			log.Printf("Failed to decode chain from peer %s: %v", peer, err)
			continue
		}

		// Replace the current blockchain if the peer's chain is longer
		if len(response.Chain) > len(blockchain.Blockchain) {
			blockchain.Blockchain = response.Chain
		}
	}
}
