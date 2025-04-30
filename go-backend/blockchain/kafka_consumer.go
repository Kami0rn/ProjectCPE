package blockchain

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"os"
)

// RequestAIProof communicates with the Python AI module via REST API
func RequestAIProof(filePaths []string, epochs string) (string, error) {
	url := "http://localhost:5000/train" // Python AI module endpoint

	// Create a buffer to hold the multipart form data
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Add all files to the form
	for _, filePath := range filePaths {
		file, err := os.Open(filePath)
		if err != nil {
			return "", err
		}
		defer file.Close()

		part, err := writer.CreateFormFile("images", file.Name())
		if err != nil {
			return "", err
		}
		_, err = io.Copy(part, file)
		if err != nil {
			return "", err
		}
	}

	// Add the epochs to the form
	if err := writer.WriteField("epochs", epochs); err != nil {
		return "", err
	}

	// Close the writer to finalize the form
	writer.Close()

	// Send the POST request
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Read the response
	respBody, _ := io.ReadAll(resp.Body)
	var response map[string]interface{}
	if err := json.Unmarshal(respBody, &response); err != nil {
		return "", err
	}

	// Extract the AI proof from the response
	aiProof, ok := response["ai_proof"].(string)
	if !ok {
		return "", nil
	}

	return aiProof, nil
}
