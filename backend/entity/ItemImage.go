package entity

import "gorm.io/gorm"

type ItemImage struct {
    gorm.Model
    // 🌟 FIX: เปลี่ยน ImageURL เป็น Image และอัปเดต JSON tag
    Image    string `json:"image" gorm:"column:image;not null"` 
    ItemID   uint   `json:"item_id" gorm:"column:item_id;not null"` 
    Item     Item   `json:"item" gorm:"foreignKey:ItemID"`
}