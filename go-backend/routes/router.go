package routes

import (
	"github.com/Kami0rn/ProjectCPE/go-backend/controllers"
	"github.com/Kami0rn/ProjectCPE/go-backend/handlers"
	"github.com/Kami0rn/ProjectCPE/go-backend/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	auth := r.Group("/auth")
	
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
	}

	api := r.Group("/api")
	api.Use(middleware.JWTAuthMiddleware())
	{
		api.GET("/chain",handlers.GetChain)
		api.POST("/transaction",handlers.AddTransaction)
		api.POST("/mine",handlers.MineBlock)
		api.GET("/me", controllers.Me)
	}

	return r
}
