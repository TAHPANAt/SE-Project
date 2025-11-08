package services

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JwtClaim กำหนดโครงสร้าง Claims ที่ฝังใน Token
type JwtClaim struct {
	Username string `json:"username"`
	UserID   uint   `json:"user_id"` 
	RoleID   uint   `json:"role_id"` 
	jwt.RegisteredClaims
}

// JwtWrapper กำหนดค่าเริ่มต้นสำหรับ Token
type JwtWrapper struct {
	SecretKey       string
	Issuer          string
	ExpirationHours int64
}

// GenerateToken สร้าง JWT Token ใหม่
func (w *JwtWrapper) GenerateToken(userUsername string, userID uint, roleID uint) (string, error) {
	expirationTime := time.Now().Add(time.Hour * time.Duration(w.ExpirationHours))

	claims := &JwtClaim{
		Username: userUsername,
		UserID:   userID,
		RoleID:   roleID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    w.Issuer,
			Subject:   userUsername,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// ดึง SecretKey จาก Environment หากไม่ได้กำหนดใน Wrapper
	secret := w.SecretKey
	if secret == "" {
		secret = os.Getenv("SECRET_KEY")
	}

	signedToken, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", errors.New("error signing token")
	}
	return signedToken, nil
}

// ValidateToken ตรวจสอบความถูกต้องของ Token
func (w *JwtWrapper) ValidateToken(signedToken string) (*JwtClaim, error) {
	claims := &JwtClaim{}

	secret := w.SecretKey
	if secret == "" {
		secret = os.Getenv("SECRET_KEY")
	}

	token, err := jwt.ParseWithClaims(signedToken, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("token is invalid or expired: " + err.Error())
	}

	return claims, nil
}