package middlewares

import (
    "net/http"
    "os"
    "strings"

    "project.com/se-68-project/services" 
    "github.com/gin-gonic/gin"
)

// Authorizes ตรวจสอบ JWT Token และฝัง Claims ลงใน Context
func Authorizes() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.Request.Header.Get("Authorization") // รับค่ามาทั้งหมด เช่น "Bearer [TOKEN]"
        
        // 1. ตรวจสอบว่า Header มีค่าหรือไม่
        if authHeader == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "No Authorization header provided"})
            return
        }

        // 2. 🌟 FIX CRITICAL: ใช้ TrimPrefix เพื่อสกัด Token อย่างแม่นยำ 🌟
        if !strings.HasPrefix(authHeader, "Bearer ") {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Incorrect Format. Expected 'Bearer [Token]'"})
            return
        }
        
        // สกัด Token โดยตัด "Bearer " ออก
        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        
        // 3. ตรวจสอบว่า Token ว่างเปล่าหรือไม่หลังการสกัด
        if tokenString == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token is missing after extraction"})
            return
        }
        
        // 4. ดึง SecretKey จาก Environment
        secretKey := os.Getenv("SECRET_KEY")
        if secretKey == "" {
             // ควรจะตั้งค่าใน main.go แต่ให้ Error 500 หาก Secret หาย
             c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Server configuration error: JWT Secret not set"})
             return
        }
        
        jwtWrapper := services.JwtWrapper{
            SecretKey: secretKey,
            Issuer:    "AuthService",
        }

        // 5. Validate Token
        // NOTE: claims ต้องเป็น *services.JwtClaim ตามที่กำหนดใน services/jwt.go
        claims, err := jwtWrapper.ValidateToken(tokenString) 
        
        if err != nil {
            // ดักจับ Error จากการตรวจสอบ (หมดอายุ, ลายเซ็นไม่ถูกต้อง, รูปแบบผิด)
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token is invalid or expired: " + err.Error()})
            return
        }
        
        // 6. ฝัง Claims ลงใน Context
        c.Set("userID", claims.UserID) 
        c.Set("username", claims.Username)
        c.Set("userRoleID", claims.RoleID)

        c.Next()
    }
}