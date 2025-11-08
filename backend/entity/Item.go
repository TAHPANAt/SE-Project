package entity

import "gorm.io/gorm"

type Item struct {
    gorm.Model
    UserID             uint        `json:"user_id" gorm:"column:user_id;not null"` // เปลี่ยนเป็น uint
    User               User        `json:"user" gorm:"foreignKey:UserID"`
    Title              string      `json:"title" gorm:"not null"`
    Description        string      `json:"description"`
    ConditionID        uint        `json:"condition_id" gorm:"column:condition_id;not null"` // เปลี่ยนเป็น uint
    Condition          Condition   `json:"condition" gorm:"foreignKey:ConditionID"`
    CategoryID         uint        `json:"category_id" gorm:"column:category_id;not null"` // เปลี่ยนเป็น uint
    Category           Category    `json:"category" gorm:"foreignKey:CategoryID"`
    StatusID           uint        `json:"status_id" gorm:"column:status_id;not null"` // เปลี่ยนเป็น uint
    Status             ItemStatus  `json:"status" gorm:"foreignKey:StatusID"`
    MeetupLocation     string      `json:"meetup_location" gorm:"column:meetup_location"`
    DesiredExchange    string      `json:"desired_exchange" gorm:"column:desired_exchange"`
    MeetupAvailability string      `json:"meetup_availability" gorm:"column:meetup_availability"`
    Images             []ItemImage `json:"images" gorm:"foreignKey:ItemID"`
}