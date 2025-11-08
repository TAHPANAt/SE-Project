package entity

import "gorm.io/gorm"

type Category struct {
    gorm.Model
    Name string `json:"name" gorm:"unique;not null"` // เปลี่ยน CategoryName เป็น Name ให้ตรงกับ db.go
}