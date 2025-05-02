package middleware

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

func JWTAuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing or invalid"})
            c.Abort()
            return
        }

        tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
        tokenStr = strings.TrimSpace(tokenStr) // เพิ่มการตัดช่องว่าง
        log.Println("Token string:", tokenStr)
        
        // ตรวจสอบว่าค่า JWT_SECRET มีหรือไม่
        secretKey := os.Getenv("JWT_SECRET")
        if secretKey == "" {
            log.Println("Warning: JWT_SECRET environment variable not set, using default")
            secretKey = "default_secret_key" // ค่า default (ใช้เฉพาะการพัฒนา)
        }
        log.Println("JWT_SECRET used for validation:", secretKey)
        
        token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
            if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
            }
            return []byte(secretKey), nil
        })

        if err != nil {
            log.Println("Token parsing error:", err)
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token: " + err.Error()})
            c.Abort()
            return
        }

        // Optionally, you can extract claims if needed
        if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
            log.Println("Token claims:", claims)
            c.Set("user_id", claims["user_id"])
            c.Set("username", claims["username"])
            c.Set("email", claims["email"])
        } else {
            log.Println("Invalid token claims")
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
            c.Abort()
            return
        }

        c.Next()
    }
}
