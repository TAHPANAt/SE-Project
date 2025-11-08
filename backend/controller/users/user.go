package users

import (
    "errors"
    "net/http"
    "os"
    "log" 

    "github.com/gin-gonic/gin"
    "github.com/go-playground/validator/v10"
    "gorm.io/gorm"

    "project.com/se-68-project/config"
    "project.com/se-68-project/entity"
    "project.com/se-68-project/services"
)

// Payloads
type AuthenPayload struct {
    Username string `json:"username" binding:"required"`
    Password string `json:"password" binding:"required"`
}

type SignUpPayload struct {
    Username  string `json:"username" binding:"required"`
    Password  string `json:"password" binding:"required,min=6"`
    FirstName string `json:"first_name" binding:"required"`
    LastName  string `json:"last_name" binding:"required"`
    Phone     string `json:"phone" binding:"required"`
}

type UserUpdatePayload struct {
    FirstName    string `json:"first_name" binding:"required"`
    LastName     string `json:"last_name" binding:"required"`
    Phone        string `json:"phone"`
    PointBalance *int    `json:"point_balance"`
    RoleID       *uint   `json:"role_id"`
    Username     string `json:"username" binding:"required"`
}

// ---------------- Authentication Handlers ----------------

func SignUp(c *gin.Context) {
    var payload SignUpPayload
    if err := c.ShouldBindJSON(&payload); err != nil {
        handleValidationErrors(c, err)
        return
    }

    db := config.GetDB() 
    var userCheck entity.User

    result := db.Where("username = ?", payload.Username).First(&userCheck)
    if result.Error == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "Username is already registered"})
        return
    }
    if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
        log.Printf("DB Error during signup check: %v", result.Error)
        c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
        return
    }

    hashedPassword, _ := config.HashPassword(payload.Password) 

    user := entity.User{
        Username:    payload.Username,
        Password:    hashedPassword,
        FirstName:   payload.FirstName,
        LastName:    payload.LastName,
        Phone:       payload.Phone,
        PointBalance: 0, 
        RoleID:      2, // Default User Role
    }

    if err := db.Create(&user).Error; err != nil {
        log.Printf("DB Error during user creation: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user", "details": err.Error()})
        return
    }

    // 🌟 FIX: ต้องสร้าง Token และส่งกลับเมื่อ SignUp สำเร็จ 🌟
    jwtWrapper := services.JwtWrapper{
        SecretKey:       os.Getenv("SECRET_KEY"), 
        Issuer:          "AuthService",
        ExpirationHours: 24,
    }
    signedToken, err := jwtWrapper.GenerateToken(user.Username, user.ID, user.RoleID)
    if err != nil {
        log.Printf("JWT Error during signup token creation: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error signing token after signup"})
        return
    }

    // 🌟 FIX: เปลี่ยน Status เป็น 200 OK และส่ง Token กลับ 🌟
    c.JSON(http.StatusOK, gin.H{
        "message": "Sign-up successful",
        "token_type": "Bearer", 
        "token": signedToken, 
        "id": user.ID, 
        "role_id": user.RoleID,
    })
}

func SignIn(c *gin.Context) {
    var payload AuthenPayload
    var user entity.User

    if err := c.ShouldBindJSON(&payload); err != nil {
        handleValidationErrors(c, err)
        return
    }
    
    db := config.GetDB()

    if err := db.Where("username = ?", payload.Username).First(&user).Error; err != nil {
        log.Printf("SignIn Failed: User %s not found in DB.", payload.Username) 
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Username or password is incorrect"})
        return
    }

    if !config.CheckPasswordHash(payload.Password, user.Password) {
        log.Printf("SignIn Failed: Password mismatch for user %s", payload.Username)
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Username or password is incorrect"})
        return
    }

    jwtWrapper := services.JwtWrapper{
        SecretKey:       os.Getenv("SECRET_KEY"), 
        Issuer:          "AuthService",
        ExpirationHours: 24,
    }

    signedToken, err := jwtWrapper.GenerateToken(user.Username, user.ID, user.RoleID)
    if err != nil {
        log.Printf("JWT Error during signin token creation: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error signing token"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Login successful",
        "token_type": "Bearer", 
        "token": signedToken, 
        "id": user.ID, 
        "role_id": user.RoleID,
    })
}

// ---------------- CRUD Functions (คงเดิม) ----------------

func GetAll(c *gin.Context) {
    var users []entity.User
    db := config.GetDB() 
    results := db.Preload("Role").Find(&users) 
    
    if results.Error != nil && !errors.Is(results.Error, gorm.ErrRecordNotFound) {
        c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
        return
    }
    c.JSON(http.StatusOK, users)
}

func Get(c *gin.Context) {
    ID := c.Param("id")
    var user entity.User
    db := config.GetDB() 

    results := db.Preload("Role").First(&user, ID) 
    
    if results.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }
    c.JSON(http.StatusOK, user)
}

func Update(c *gin.Context) {
    var user entity.User
    db := config.GetDB() 
    UserID := c.Param("id")

    if result := db.First(&user, UserID); result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User ID not found"})
        return
    }

    var payload UserUpdatePayload
    if err := c.ShouldBindJSON(&payload); err != nil {
        handleValidationErrors(c, err)
        return
    }
    
    user.FirstName = payload.FirstName
    user.LastName = payload.LastName
    user.Phone = payload.Phone
    user.Username = payload.Username
    
    if payload.PointBalance != nil {
        user.PointBalance = *payload.PointBalance
    }
    
    if payload.RoleID != nil {
        user.RoleID = *payload.RoleID
    }

    if result := db.Save(&user); result.Error != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update user", "details": result.Error.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

func Delete(c *gin.Context) {
    id := c.Param("id")
    db := config.GetDB() 
    
    if tx := db.Where("id = ?", id).Delete(&entity.User{}); tx.RowsAffected == 0 { 
        c.JSON(http.StatusBadRequest, gin.H{"error": "User ID not found or already deleted"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// Utility Function
func handleValidationErrors(c *gin.Context, err error) {
    if validationErrors, ok := err.(validator.ValidationErrors); ok {
        var errorMessages []string
        for _, fieldError := range validationErrors {
            errorMessage := fieldError.Field() + " is " + fieldError.Tag() + " or invalid."
            errorMessages = append(errorMessages, errorMessage)
        }
        c.JSON(http.StatusBadRequest, gin.H{"message": "Validation failed", "errors": errorMessages})
        return
    }
    c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request format", "error": err.Error()})
}