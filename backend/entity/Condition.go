package entity

import "gorm.io/gorm"

type Condition struct {
    gorm.Model
    ConditionName string `json:"condition_name" gorm:"column:condition_name;unique;not null"`
}