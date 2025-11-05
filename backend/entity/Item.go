package entity

import (
	"gorm.io/gorm"
)

type Item struct {
	gorm.Model
	UserID             int         `json:"user_id" gorm:"column:user_id"`
	User               User        `json:"user" gorm:"foreignKey:UserID"`
	Title              string      `json:"title"`
	Description        string      `json:"description"`
	ConditionID        int         `json:"condition_id" gorm:"column:condition_id"`
	Condition          Condition   `json:"condition" gorm:"foreignKey:ConditionID"`
	CategoryID         int         `json:"category_id" gorm:"column:category_id"`
	Category           Category    `json:"category" gorm:"foreignKey:CategoryID"`
	StatusID           int         `json:"status_id" gorm:"column:status_id"`
	Status             ItemStatus  `json:"status" gorm:"foreignKey:StatusID"`
	MeetupLocation     string      `json:"meetup_location" gorm:"column:meetup_location"`
	DesiredExchange    string      `json:"desired_exchange" gorm:"column:desired_exchange"`
	MeetupAvailability string      `json:"meetup_availability" gorm:"column:meetup_availability"`
	Images             []ItemImage `json:"images" gorm:"foreignKey:ItemID"`
}