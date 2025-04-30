package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Me(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user_id not found in context"})
		return
	}

	username := c.GetString("username")

	c.JSON(http.StatusOK, gin.H{
		"user_id":  userID,
		"username": username,
	})
}
