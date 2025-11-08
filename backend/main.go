package main

import (
	"errors"
	"log"
	"net/http"
	"os"
	"time"

	// 🌟 1. IMPORT ที่เพิ่มเข้ามา
	"path/filepath" // (สำหรับจัดการ Path ของไฟล์)
	"github.com/google/uuid" // (สำหรับสร้างชื่อไฟล์ที่ไม่ซ้ำกัน)
	// 🌟 (End Import ที่เพิ่มเข้ามา)

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"project.com/se-68-project/config"
	"project.com/se-68-project/controller/items"
	"project.com/se-68-project/controller/lookups"
	"project.com/se-68-project/controller/roles"
	"project.com/se-68-project/controller/users"
	"project.com/se-68-project/entity"
	"project.com/se-68-project/middlewares"
)

// InitialRoleSetup ตรวจสอบและสร้าง Role, Admin User, และ Master Data
func InitialRoleSetup() {
    // ... (โค้ดส่วนนี้ของคุณเหมือนเดิมทุกประการ) ...
	db := config.GetDB() 
    
    // --- 1. สร้าง Roles (Admin ID=1, User ID=2) ---
    roles := []entity.Role{
        {RoleName: "Admin"},
        {RoleName: "User"},
    }
    for _, role := range roles {
        db.Where(entity.Role{RoleName: role.RoleName}).FirstOrCreate(&role)
    }
    log.Println("Initial Roles (Admin, User) ensured.")


    // --- 2. สร้าง Admin User (ถ้ายังไม่มี) ---
    var adminUser entity.User
    result := db.Where("username = ?", "admin").First(&adminUser) 

    if errors.Is(result.Error, gorm.ErrRecordNotFound) {
        adminPassword := "AdminPass123" 
        hashedPassword, _ := config.HashPassword(adminPassword) 

        adminUser := entity.User{
            Username:     "admin", 
            Password:     hashedPassword,
            FirstName:    "Super",
            LastName:     "Admin",
            Phone:        "0000000000",
            PointBalance: 9999,
            RoleID:       1, // Admin Role
        }

        if err := db.Create(&adminUser).Error; err != nil {
            log.Fatalf("Failed to create initial admin user: %v", err)
        }
        log.Printf("Initial Admin User 'admin' created successfully. Password for LOGIN: %s", adminPassword)
    } else {
         log.Println("Admin user 'admin' already exists, skipping creation.")
    }
    
    // --- 3. สร้าง Category/Condition เริ่มต้น ---
    
    categories := []entity.Category{{Name: "Electronics"}, {Name: "Books"}, {Name: "Clothing"}}
    for _, cat := range categories {
        db.Where(entity.Category{Name: cat.Name}).FirstOrCreate(&cat)
    }
    log.Println("Initial Categories ensured.")
    
    conditions := []entity.Condition{{ConditionName: "New"}, {ConditionName: "Like New"}, {ConditionName: "Used"}}
    for _, cond := range conditions {
        db.Where(entity.Condition{ConditionName: cond.ConditionName}).FirstOrCreate(&cond)
    }
    log.Println("Initial Conditions ensured.")

    statuses := []entity.ItemStatus{{StatusName: "Available"}, {StatusName: "Pending"}, {StatusName: "Exchanged"}}
    for _, status := range statuses {
        db.Where(entity.ItemStatus{StatusName: status.StatusName}).FirstOrCreate(&status)
    }
    log.Println("Initial Item Statuses ensured.")
}

// 🌟 2. เพิ่มฟังก์ชัน HANDLEUPLOAD 🌟
// (นี่คือฟังก์ชันที่จะจัดการ `POST /upload`)
func HandleUpload(c *gin.Context) {
	// "file" คือ key ที่ React (FormData) ส่งมา
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file is received"})
		return
	}

	// สร้างชื่อไฟล์ใหม่ที่ไม่ซ้ำกัน (เช่น "uuid-random.jpg")
	extension := filepath.Ext(file.Filename)
	newFilename := uuid.New().String() + extension

	// สร้างโฟลเดอร์ 'uploads' ถ้ายังไม่มี
	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create upload directory"})
		return
	}

	// ตำแหน่งที่จะบันทึกไฟล์
	savePath := filepath.Join(uploadDir, newFilename)

	// บันทึกไฟล์
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to save the file"})
		return
	}

	// 🌟 ส่ง "ชื่อไฟล์" ใหม่ กลับไปให้ React 🌟
	// (ซึ่งตรงกับที่ React คาดหวัง `result.filename`)
	c.JSON(http.StatusOK, gin.H{"filename": newFilename})
}

// 🌟 (End ฟังก์ชัน HandleUpload) 🌟


func main() {
	// 1. Database Connection and Migration
	config.ConnectDB()
	db := config.GetDB()

	db.AutoMigrate(
		&entity.Role{}, &entity.User{}, &entity.Category{}, &entity.Condition{},
		&entity.ItemStatus{}, &entity.Item{}, &entity.ItemImage{},
	)

	// 2. Initial Setup
	InitialRoleSetup()

	if os.Getenv("SECRET_KEY") == "" {
		os.Setenv("SECRET_KEY", "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx")
	}

	// 3. Gin Router and CORS Configuration
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000", "http://localhost:5174"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 4. Public Routes
	public := router.Group("/")
	{
		// 🌟 3. เพิ่ม STATIC FILE SERVING 🌟
		// (ทำให้ Browser เข้าถึงไฟล์ที่อัปโหลดได้ผ่าน /static/...)
		public.Static("/static", "./uploads")

		public.POST("/signup", users.SignUp)
		public.POST("/signin", users.SignIn)
		public.GET("/roles", roles.GetAll)

		public.GET("/categories", lookups.GetCategories)
		public.GET("/conditions", lookups.GetConditions)

		public.GET("/items/all", items.GetAll)
		public.GET("/item/:id", items.Get)

		public.GET("/items/category/:id", items.GetItemsByCategory)
		public.GET("/user/:id/items", items.GetItemsByUser)

		public.GET("/", func(c *gin.Context) {
			c.String(http.StatusOK, "Backend Server is running on Go/Gin")
		})
	}

	// 5. Protected Routes
	protected := router.Group("/")
	protected.Use(middlewares.Authorizes())
	{
		// 🌟 4. เพิ่ม ROUTE /UPLOAD 🌟
		// (นี่คือ Endpoint ที่ React เรียกหา)
		protected.POST("/upload", HandleUpload)

		// User CRUD
		protected.GET("/users", users.GetAll)
		protected.GET("/user/:id", users.Get)
		protected.PUT("/user/:id", users.Update)
		protected.DELETE("/user/:id", users.Delete)

		// Item CRUD
		protected.POST("/item", items.CreateItem)
		protected.PUT("/item/:id", items.UpdateItem)
		protected.DELETE("/item/:id", items.DeleteItem)

		protected.PATCH("/item/:id/status", items.UpdateItemStatus)
	}

	// 6. Run Server
	port := "8000"
	log.Printf("Main: Server starting on http://localhost:%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}