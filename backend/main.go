package main

import (
	"fmt"

	"project.com/se-68-project/config"
)

func main() {

	// 1. เปิดการเชื่อมต่อฐานข้อมูล
	//    (เรียกฟังก์ชันจาก config/db.go)
	config.ConnectionDB()

	// 2. สร้างตารางและใส่ข้อมูลเริ่มต้น (Seed)
	//    (เรียกฟังก์ชันจาก config/db.go)
	config.SetupDatabase()

	// เมื่อโปรแกรมทำงานถึงตรงนี้
	// ฐานข้อมูลจะถูกเชื่อมต่อ, สร้างตาราง, และ seed ข้อมูลเรียบร้อยแล้ว
	fmt.Println("Main: Database setup complete. Program finished.")
}