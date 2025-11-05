package entity

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username     string `json:"username" gorm:"unique"`
	Password     string `json:"-"` // ไม่ควรส่ง password ออกไปใน JSON
	FirstName    string `json:"first_name" gorm:"column:first_name"`
	LastName     string `json:"last_name" gorm:"column:last_name"`
	Phone        string `json:"phone"`
	PointBalance int    `json:"point_balance" gorm:"column:point_balance"`
	RoleID       int    `json:"role_id" gorm:"column:role_id"`
	Role         Role   `json:"role" gorm:"foreignKey:RoleID"`
	Last		string
}