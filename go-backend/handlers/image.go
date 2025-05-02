package handlers

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"

	"github.com/gin-gonic/gin"
)

// FetchGeneratedImage sends a request to the Python backend to generate an image
func FetchGeneratedImage(username, modelName string) ([]byte, error) {
	// Prepare the form data
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	_ = writer.WriteField("username", username)
	_ = writer.WriteField("model_name", modelName)
	writer.Close()

	// Send the request to the Python backend
	req, err := http.NewRequest("POST", "http://localhost:5000/generate", body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch image: %s", resp.Status)
	}

	// Read the image data from the response
	imageData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read image data: %v", err)
	}

	return imageData, nil
}

// GenerateImageHandler handles the API request to fetch a generated image
func GenerateImageHandler(c *gin.Context) {
	username := c.Query("username")
	modelName := c.Query("model_name")

	if username == "" || modelName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "username and model_name are required"})
		return
	}

	// Fetch the generated image from the Python backend
	imageData, err := FetchGeneratedImage(username, modelName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return the image as a binary response
	c.Data(http.StatusOK, "image/png", imageData)
}
