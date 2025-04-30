package main

import (
	"log"

	"github.com/Kami0rn/ProjectCPE/go-backend/blockchain"
	"github.com/Kami0rn/ProjectCPE/go-backend/config"
	"github.com/Kami0rn/ProjectCPE/go-backend/database"
	"github.com/Kami0rn/ProjectCPE/go-backend/routes"
	"github.com/joho/godotenv"
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}
}

func main() {
	config.LoadEnv()
	database.ConnectDB()

	// Initialize the genesis block
	blockchain.InitGenesisBlock()

	// Start the Gin HTTP server
	r := routes.SetupRouter()
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
