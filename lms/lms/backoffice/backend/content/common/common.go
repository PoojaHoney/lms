package common

import (
	"bytes"
	"crypto/rand"
	"crypto/sha1"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/pkg/errors"
	"github.com/xdg-go/pbkdf2"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func HashPassword(password string) (string, string) {
	salt, _ := GetRandomBytes(0x10)
	hashedPassword := pbkdf2.Key([]byte(password), salt, 1000, 49, sha1.New)
	return base64.StdEncoding.EncodeToString(hashedPassword), base64.StdEncoding.EncodeToString(salt)
}

func GetRandomBytes(len int) ([]byte, error) {
	key := make([]byte, len)
	_, err := rand.Read(key)
	if err != nil {
		return nil, errors.Wrap(err, "error getting random bytes")
	}
	return key, nil
}

func VerifyHashPassword(hashPassword string, password string, version int, salt_stored string) bool {
	if version == 1 {
		hashedPassword, err := base64.StdEncoding.DecodeString(hashPassword)
		if err != nil {
			fmt.Printf("Error decoding string: %s ", err.Error())
			return false
		}
		salt_dst := make([]byte, 0x10)
		hashedKey := make([]byte, 0x20)
		copy(salt_dst, hashedPassword[1:17])
		copy(hashedKey, hashedPassword[17:49])
		password_hash := pbkdf2.Key([]byte(password), salt_dst, 1000, 32, sha1.New)
		return bytes.Equal(password_hash, hashedKey)
	} else {
		salt_stored, _ := base64.StdEncoding.DecodeString(salt_stored)
		hashPassword, _ := base64.StdEncoding.DecodeString(hashPassword)
		password_hash := pbkdf2.Key([]byte(password), []byte(salt_stored), 1000, 49, sha1.New)
		return bytes.Equal(password_hash, hashPassword)
	}

}

func GenerateTokens(userID string) (string, string, error) {
    // Generate access token
    accessClaims := jwt.MapClaims{
        "userId": userID,
        "exp":     time.Now().Add(time.Minute * 15).Unix(),
    }
    accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
    accessTokenString, err := accessToken.SignedString([]byte("r9tWqmF#Y2P$%78G"))
    if err != nil {
        return "", "", err
    }
    // Generate refresh token
    refreshClaims := jwt.MapClaims{
        "userId": userID,
        "exp":     time.Now().Add(time.Hour * 24 * 7).Unix(),
    }
    refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
    refreshTokenString, err := refreshToken.SignedString([]byte("6X!yT@Zu$2F&vP#N"))
    if err != nil {
        return "", "", err
    }
    return accessTokenString, refreshTokenString, nil
}

func RefreshAccessToken(refreshToken string) (string, string, error) {
    token, err := jwt.Parse(refreshToken, func(token *jwt.Token) (interface{}, error) {
        return []byte("6X!yT@Zu$2F&vP#N"), nil
    })
    if err != nil {
        return "", "", err
    }
    if !token.Valid {
        return "", "", errors.New("invalid refresh token")
    }
    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok {
        return "", "", errors.New("invalid token claims")
    }
    userID := claims["userId"].(string)
    // Generate new access token
    accessToken, _, err := GenerateTokens(userID)
    if err != nil {
        return "", "", err
    }
    return accessToken, userID, nil
}

func FindString(data primitive.A,key string) bool{
    found := false
	for _, item := range data {
		if item == key {
			found = true
			break
		}
	}
    return found
}