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
		"exp":    time.Now().Add(time.Minute * 15).Unix(),
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString([]byte("r9tWqmF#Y2P$%78G"))
	if err != nil {
		return "", "", err
	}
	// Generate refresh token
	refreshClaims := jwt.MapClaims{
		"userId": userID,
		"exp":    time.Now().Add(time.Hour * 24 * 7).Unix(),
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString([]byte("6X!yT@Zu$2F&vP#N"))
	if err != nil {
		return "", "", err
	}
	return accessTokenString, refreshTokenString, nil
}

func RefreshAccessToken(refreshToken string) (string, string,string, error) {
	token, err := jwt.Parse(refreshToken, func(token *jwt.Token) (interface{}, error) {
		return []byte("6X!yT@Zu$2F&vP#N"), nil
	})
	if err != nil {
		return "", "","", err
	}
	if !token.Valid {
		return "", "","", errors.New("invalid refresh token")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", "","", errors.New("invalid token claims")
	}
	userID := claims["userId"].(string)
	// Generate new access token
	accessToken, _, err := GenerateTokens(userID)
	if err != nil {
		return "", "","", err
	}
	return accessToken, userID,claims["role"].(string), nil
}

func GenerateRandomPassword(length int) (string, error) {
	numBytes := length / 4 * 3
	if length%4 != 0 {
		numBytes++
	}
	bytes := make([]byte, numBytes)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	password := base64.URLEncoding.EncodeToString(bytes)
	password = password[:length]
	return password, nil
}



// if c.Path() == "/api/module/v2/startfastchannel" {
//     c.Next()
// }
// var response map[string]interface{}
// var expiryTime int
// tokenCollection := service.Db.Database(getEnvDecrypt("mongodb.database")).Collection(getEnv("mongodb.tokenCollection"))
// reqToken := c.Get("Authorization")
// splitToken := strings.Split(reqToken, "Bearer ")
// if len(splitToken) < 2 {
//     return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Token not valid"})
// }
// reqToken = splitToken[1]
// if reqToken != "" {
    // err := tokenCollection.FindOne(context.TODO(), bson.M{"access_token": reqToken}).Decode(&response)
    // if err != nil {
    //     fmt.Println("error in finding token", err)
    //     return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Authorization has been denied for this request"})
    // }
    // timeNow := time.Now()
    // accessExpiry := response["createdAt"].(primitive.DateTime).Time()
    // accessData := timeNow.Sub(accessExpiry)
    // expiryTime = int(accessData.Minutes())
// }
// if response["id"] != "" && response["id"] != nil && (expiryTime < 30) {
//     c.Context().SetUserValue("userId", response["id"])
//     c.Context().SetUserValue("objectId", response["key"])
//     log.Printf("authorization accepted: %v", response)
//     c.Next()
// } else {
//     return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Authorization has been denied for this request"})
// }
// return nil