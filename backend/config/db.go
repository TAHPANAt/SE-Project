package config

import (
	"fmt"

	"project.com/se-68-project/entity"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

func ConnectionDB() {
	
	database, err := gorm.Open(sqlite.Open("exchange.db?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	fmt.Println("connected database")
	db = database
}


func SetupDatabase() {

	db.AutoMigrate(
		&entity.Role{},
		&entity.Category{},
		&entity.ItemStatus{},
		&entity.Condition{},
		&entity.User{},
		&entity.Item{},
		&entity.ItemImage{},
	)
}