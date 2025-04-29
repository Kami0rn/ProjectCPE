package main

import (
	"log"

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

	r := routes.SetupRouter()
	r.Run(":8080")
}
