package entity

import (
	"gorm.io/gorm"
)

type ItemImage struct {
	gorm.Model
	ImageURL string `json:"image_url" gorm:"column:image_url"`
	ItemID   int    `json:"item_id" gorm:"column:item_id"`
}