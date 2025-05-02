package routes

import (
	"net/http"

	"github.com/Kami0rn/ProjectCPE/go-backend/controllers"
	"github.com/Kami0rn/ProjectCPE/go-backend/handlers"
	"github.com/Kami0rn/ProjectCPE/go-backend/middleware"
	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight OPTIONS request
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}

		c.Next()
	}
}

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Apply CORS middleware
	r.Use(CORSMiddleware())

	auth := r.Group("/auth")

	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
	}

	api := r.Group("/api")
	api.Use(middleware.JWTAuthMiddleware())
	{
		api.GET("/chain", handlers.GetChain)
		api.POST("/transaction", handlers.AddTransaction)
		api.POST("/mine", handlers.MineBlock)
		api.GET("/me", controllers.Me)
		api.POST("/check-image", handlers.CheckImage) // New endpoint
		api.POST("/add-peer", handlers.AddPeer)
		api.GET("/generate-image", handlers.GenerateImageHandler)

	}

	r.POST("/api/receive-block", handlers.ReceiveBlock)

	return r
}
