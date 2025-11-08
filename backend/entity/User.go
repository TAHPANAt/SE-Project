package entity

import "gorm.io/gorm"

type User struct {
    gorm.Model
    Username     string `json:"username" gorm:"unique;not null"`
    Password     string `json:"-" gorm:"not null"` // ไม่แสดงใน JSON
    FirstName    string `json:"first_name" gorm:"column:first_name"`
    LastName     string `json:"last_name" gorm:"column:last_name"`
    Phone        string `json:"phone"`
    PointBalance int    `json:"point_balance" gorm:"column:point_balance;default:0"`
    RoleID       uint   `json:"role_id" gorm:"column:role_id;not null"` // เปลี่ยนเป็น uint
    Role         Role   `json:"role" gorm:"foreignKey:RoleID"`
}