package main

import (
	"flag"
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
	// Add a flag for the port
	port := flag.String("port", "8080", "Port to run the server on")
	flag.Parse()

	config.LoadEnv()
	database.ConnectDB()

	// Initialize the genesis block
	blockchain.InitGenesisBlock()

	// Start the Gin HTTP server
	r := routes.SetupRouter()
	if err := r.Run(":" + *port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
