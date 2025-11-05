package entity

import (
	"gorm.io/gorm"
)

type ItemStatus struct {
	gorm.Model
	StatusName string `json:"status_name" gorm:"column:status_name"`
}