package roles

import (
    "net/http"
    "errors"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"

    "project.com/se-68-project/config"
    "project.com/se-68-project/entity" 
)

// GetAll ดึง Role ทั้งหมดจากฐานข้อมูล
func GetAll(c *gin.Context) {
    var roles []entity.Role
    db := config.GetDB() // <--- แก้ไข
    
    results := db.Find(&roles) 
    
    if results.Error != nil && !errors.Is(results.Error, gorm.ErrRecordNotFound) {
        c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
        return
    }

    c.JSON(http.StatusOK, roles)
}