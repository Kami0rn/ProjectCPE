package handlers

import (
    "net/http"

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