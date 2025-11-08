package lookups

import (
	"net/http"
	"errors"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"project.com/se-68-project/config"
	"project.com/se-68-project/entity"
)

// GetCategories ดึงรายการ Category ทั้งหมด
func GetCategories(c *gin.Context) {
	var categories []entity.Category
	db := config.GetDB()
	
	results := db.Find(&categories) 
	
	if results.Error != nil && !errors.Is(results.Error, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, categories)
}

// GetConditions ดึงรายการ Condition ทั้งหมด
func GetConditions(c *gin.Context) {
	var conditions []entity.Condition
	db := config.GetDB()
	
	results := db.Find(&conditions) 
	
	if results.Error != nil && !errors.Is(results.Error, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, conditions)
}