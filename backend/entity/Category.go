package entity

import (
	"gorm.io/gorm"
)

type Category struct {
	gorm.Model
	CategoryName string `json:"category_name" gorm:"column:category_name"`
}