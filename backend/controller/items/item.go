package items

import (
    "errors"
    "net/http"
    "log" // (Import log ยังอยู่ได้ แต่เราจะ comment out การใช้งาน)
    //"strconv"

    "github.com/gin-gonic/gin"
    "github.com/go-playground/validator/v10"
    "gorm.io/gorm"

    "project.com/se-68-project/config"
    "project.com/se-68-project/entity"
)

// ====================================================================
// Payloads
// ====================================================================

type ItemPayload struct {
    Title                   string   `json:"title" binding:"required"`
    Description             string   `json:"description" binding:"required"`
    ConditionID             uint     `json:"condition_id" binding:"required"`
    CategoryID              uint     `json:"category_id" binding:"required"`
    MeetupLocation          string   `json:"meetup_location"`
    DesiredExchange         string   `json:"desired_exchange"`
    MeetupAvailability      string   `json:"meetup_availability"`
    Image                   []string `json:"image"` // (ถูกต้องตามที่คุณต้องการ)
}

type UpdateStatusPayload struct {
    StatusID uint `json:"status_id" binding:"required"`
}

// ====================================================================
// CREATE (POST /item)
// ====================================================================
func CreateItem(c *gin.Context) {
    userIDInterface, exists := c.Get("userID")
    if !exists { 
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context."})
        return
    }
    var userID uint
    if idVal, ok := userIDInterface.(uint); ok {
        userID = idVal
    } else if idFloat, ok := userIDInterface.(float64); ok {
        userID = uint(idFloat)
    } else { 
        c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID format error."})
        return
    }
    
    var payload ItemPayload
    if err := c.ShouldBindJSON(&payload); err != nil {
        handleItemValidationErrors(c, err)
        return
    }

    db := config.GetDB() 
    tx := db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    item := entity.Item{
        UserID:             userID, 
        Title:              payload.Title,
        Description:        payload.Description,
        ConditionID:        payload.ConditionID,
        CategoryID:         payload.CategoryID,
        StatusID:           1, 
        MeetupLocation:     payload.MeetupLocation,
        DesiredExchange:    payload.DesiredExchange,
        MeetupAvailability: payload.MeetupAvailability,
    }
    
    // 🌟 FIX: Comment out Log Debugging 🌟
    // log.Printf("[CreateItem] DEBUG: Attempting to create item...") 

    if err := tx.Create(&item).Error; err != nil {
        tx.Rollback()
        // 🌟 FIX: Comment out Log Debugging 🌟
        // (เรายังคง log error ที่นี่ได้ แต่ต้องระวังการตั้งค่า Logger)
        log.Printf("❌ ERROR [CreateItem] GORM Error: %v", err) // (Log ที่จำเป็น)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create item", "details": err.Error()})
        return
    }

    if len(payload.Image) > 0 {
        var images []entity.ItemImage
        for _, url := range payload.Image { 
            images = append(images, entity.ItemImage{
                Image:  url, 
                ItemID: item.ID,
            })
        }
        if err := tx.Create(&images).Error; err != nil {
            tx.Rollback()
            // 🌟 FIX: Comment out Log Debugging 🌟
            log.Printf("❌ ERROR [CreateItem] GORM Error (Images): %v", err) // (Log ที่จำเป็น)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create item images", "details": err.Error()})
            return
        }
    }
    tx.Commit()
    
    // 🌟 FIX: Comment out Log Debugging (Success) 🌟
    // log.Printf("✅ SUCCESS [CreateItem]: Item created successfully. Item ID: %d", item.ID)
    
    c.JSON(http.StatusCreated, gin.H{"message": "Item registered successfully", "item_id": item.ID})
}

// ====================================================================
// READ (GET /items/all, GET /item/:id)
// ====================================================================
func GetAll(c *gin.Context) {
    var items []entity.Item
    db := config.GetDB() 
    results := db.Preload("User.Role").Preload("Condition").Preload("Category").Preload("Status").Preload("Images").Find(&items) 
    if results.Error != nil && !errors.Is(results.Error, gorm.ErrRecordNotFound) { 
        c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
        return
    }
    c.JSON(http.StatusOK, items)
}

func Get(c *gin.Context) {
    ID := c.Param("id")
    var item entity.Item
    db := config.GetDB() 
    results := db.Preload("User.Role").Preload("Condition").Preload("Category").Preload("Status").Preload("Images").First(&item, ID) 
    if results.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
        return
    }
    c.JSON(http.StatusOK, item)
}


// ====================================================================
// UPDATE (PUT /item/:id)
// ====================================================================
func UpdateItem(c *gin.Context) {
    db := config.GetDB()
    itemID := c.Param("id")
    userID, _ := c.Get("userID")
    userRoleID, _ := c.Get("userRoleID")
    var item entity.Item
    if err := db.First(&item, itemID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
        return
    }
    if item.UserID != userID.(uint) && userRoleID.(uint) != 1 {
        c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to edit this item"})
        return
    }
    var payload ItemPayload
    if err := c.ShouldBindJSON(&payload); err != nil {
        handleItemValidationErrors(c, err)
        return
    }
    
    tx := db.Begin()
    
    item.Title = payload.Title
    item.Description = payload.Description
    item.ConditionID = payload.ConditionID
    item.CategoryID = payload.CategoryID
    item.MeetupLocation = payload.MeetupLocation
    item.DesiredExchange = payload.DesiredExchange
    item.MeetupAvailability = payload.MeetupAvailability
    if err := tx.Save(&item).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update item", "details": err.Error()})
        return
    }

    if err := tx.Where("item_id = ?", item.ID).Delete(&entity.ItemImage{}).Error; err != nil {
         tx.Rollback()
         c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update images (step 1)", "details": err.Error()})
         return
    }

    if len(payload.Image) > 0 {
        var images []entity.ItemImage
        for _, url := range payload.Image { 
            images = append(images, entity.ItemImage{
                Image:  url,
                ItemID: item.ID,
            })
        }
        if err := tx.Create(&images).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update images (step 2)", "details": err.Error()})
            return
        }
    }
    tx.Commit()
    c.JSON(http.StatusOK, gin.H{"message": "Item updated successfully", "item_id": item.ID})
}

// ====================================================================
// DELETE (DELETE /item/:id)
// ====================================================================
func DeleteItem(c *gin.Context) {
    db := config.GetDB()
    itemID := c.Param("id")
    userID, _ := c.Get("userID")
    userRoleID, _ := c.Get("userRoleID")
    var item entity.Item
    if err := db.First(&item, itemID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
        return
    }
    if item.UserID != userID.(uint) && userRoleID.(uint) != 1 {
        c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to delete this item"})
        return
    }
    tx := db.Begin()
    if err := tx.Where("item_id = ?", item.ID).Delete(&entity.ItemImage{}).Error; err != nil {
         tx.Rollback()
         c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete item associations", "details": err.Error()})
         return
    }
    if err := tx.Delete(&item).Error; err != nil {
         tx.Rollback()
         c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete item", "details": err.Error()})
         return
    }
    tx.Commit()
    c.JSON(http.StatusOK, gin.H{"message": "Item deleted successfully"})
}

// ====================================================================
// NEW: GET ITEMS BY CATEGORY (GET /items/category/:id)
// ====================================================================
func GetItemsByCategory(c *gin.Context) {
    categoryID := c.Param("id")
    var items []entity.Item
    db := config.GetDB() 
    results := db.Preload("User.Role").Preload("Condition").Preload("Category").Preload("Status").Preload("Images").Where("category_id = ?", categoryID).Find(&items) 
    if results.Error != nil && !errors.Is(results.Error, gorm.ErrRecordNotFound) { 
        c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
        return
    }
    c.JSON(http.StatusOK, items)
}

// ====================================================================
// NEW: GET ITEMS BY USER (GET /user/:id/items)
// ====================================================================
func GetItemsByUser(c *gin.Context) {
    userID := c.Param("id")
    var items []entity.Item
    db := config.GetDB() 
    results := db.Preload("User.Role").Preload("Condition").Preload("Category").Preload("Status").Preload("Images").Where("user_id = ?", userID).Find(&items) 
    if results.Error != nil && !errors.Is(results.Error, gorm.ErrRecordNotFound) { 
        c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
        return
    }
    c.JSON(http.StatusOK, items)
}

// ====================================================================
// NEW: UPDATE STATUS (PATCH /item/:id/status)
// ====================================================================
func UpdateItemStatus(c *gin.Context) {
    db := config.GetDB()
    itemID := c.Param("id")
    userID, _ := c.Get("userID")
    userRoleID, _ := c.Get("userRoleID")
    var item entity.Item
    if err := db.First(&item, itemID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
        return
    }
    if item.UserID != userID.(uint) && userRoleID.(uint) != 1 {
        c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to update this item's status"})
        return
    }
    var payload UpdateStatusPayload
    if err := c.ShouldBindJSON(&payload); err != nil {
        handleItemValidationErrors(c, err)
        return
    }
    if err := db.Model(&item).Update("StatusID", payload.StatusID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update item status", "details": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "Item status updated successfully", "item_id": item.ID, "new_status_id": payload.StatusID})
}


// ====================================================================
// Utility Function
// ====================================================================
func handleItemValidationErrors(c *gin.Context, err error) {
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