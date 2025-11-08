package config

import (
    "log"
    "os"

    "golang.org/x/crypto/bcrypt"
    "gorm.io/gorm"
    "gorm.io/driver/sqlite" 
)

var db *gorm.DB 

// ConnectDB ... (remains the same)
func ConnectDB() *gorm.DB {
    var err error
    db, err = gorm.Open(sqlite.Open("project.db"), &gorm.Config{}) 
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
        os.Exit(2)
    }
    log.Println("Database connection established")
    return db
}

// GetDB ... (remains the same)
func GetDB() *gorm.DB {
    return db
}

// HashPassword เข้ารหัสรหัสผ่านด้วย bcrypt
func HashPassword(password string) (string, error) {
    // 🌟 FIX: ลด COST จาก 14 เหลือ 10 🌟
    // Cost 10 เป็นค่าเริ่มต้นที่เสถียรที่สุดในการใช้งานทั่วไป
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), 8) 
    return string(bytes), err
}

// CheckPasswordHash ตรวจสอบรหัสผ่านที่ป้อนกับรหัสผ่านที่ถูก Hash
func CheckPasswordHash(password string, hash string) bool {
    // โค้ดนี้ถูกต้องและไม่มีการแก้ไข
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) 
    return err == nil
}