package handlers

import (
	"encoding/base64"
	"io/ioutil"
	"math/rand"
	"net/http"
	"path/filepath"

	"github.com/Kami0rn/ProjectCPE/go-backend/database"
	"github.com/Kami0rn/ProjectCPE/go-backend/models"
	"github.com/gin-gonic/gin"
)

// GetAllModels retrieves all models from the database
func GetAllModels(c *gin.Context) {
	var models []models.Model

	// Query the database for all models
	if err := database.DB.Find(&models).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve models"})
		return
	}

	// Return the models as JSON
	c.JSON(http.StatusOK, gin.H{"models": models})
}

// GetModel retrieves a specific model from the database and attaches a sample picture
func GetModel(c *gin.Context) {
	// Get dynamic values from JSON body
	var req struct {
		Username  string `json:"username"`
		ModelName string `json:"model_name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	username := req.Username
	modelName := req.ModelName

	if username == "" || modelName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "username and model_name are required"})
		return
	}

	// Query the database for the specific model
	var model models.Model
	if err := database.DB.Where("name = ? AND created_by = ?", modelName, username).First(&model).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Model not found"})
		return
	}

	// Construct the path to the uploaded images directory dynamically
	imagesDir := filepath.Join("C:\\Project\\go-backend\\user_data", username, modelName, "uploaded_images")

	// List all files in the directory
	files, err := ioutil.ReadDir(imagesDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to read images directory"})
		return
	}

	// Filter and randomly select up to 4 image files
	var selectedImages []string
	for _, file := range files {
		if !file.IsDir() {
			selectedImages = append(selectedImages, filepath.Join(imagesDir, file.Name()))
		}
	}

	// Shuffle and pick up to 4 images
	rand.Shuffle(len(selectedImages), func(i, j int) {
		selectedImages[i], selectedImages[j] = selectedImages[j], selectedImages[i]
	})
	if len(selectedImages) > 4 {
		selectedImages = selectedImages[:4]
	}

	// Read and encode the selected images as base64
	var encodedImages []string
	for _, imagePath := range selectedImages {
		imageData, err := ioutil.ReadFile(imagePath)
		if err == nil {
			encodedImages = append(encodedImages, base64.StdEncoding.EncodeToString(imageData))
		}
	}

	// Return the model and the selected images as JSON
	c.JSON(http.StatusOK, gin.H{
		"model":         model,
		"sample_images": encodedImages,
	})
}
