package main

import (
	"time"
	"user/common"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/mongo"
)

type Service struct {
	Router  *fiber.App
	Config  common.ServiceConfiguration
	MongoDB *mongo.Client
}

type Credentials struct {
	Username     string `json:"username" validate:"required"`
	Password     string `json:"password" validate:"required"`
	RefreshToken string `json:"refreshToken"`
}

type User struct {
	EnrollID    string    `json:"enrollID" bson:"enrollID" validate:"required"`
	Name        string    `json:"name" bson:"name" validate:"required"`
	Department 	string 	  `json:"department" bson:"department" validate:"required"`
	Image		string   	`json:"image" bson:"image"`
	Designation string 	  `json:"designation" bson:"designation"`
	Description  string   `json:"description" bson:"description"`
	Batch 		string 	  `json:"batch" bson:"batch"`
	Email 	    string    `json:"email" bson:"email" validate:"required"`
	Password 	string 	  `json:"password" bson:"password" validate:"required"`
	SaltStored 	string    `json:"saltStored" bson:"saltStored"`
	Phone       string    `json:"phone" bson:"phone" validate:"required"`
	DateOfBirth string    `json:"dateOfBirth" bson:"dateOfBirth" validate:"required"`
	BloodGroup  string    `json:"bloodGroup"`
	Address     string    `json:"address" bson:"address" validate:"required"`
	Role 		string 	  `json:"role" bson:"role" validate:"required"`
	Active      bool      `json:"active" bson:"active"`
	Status 		string 	  `json:"status" bson:"status"`
	CreatedAt   time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt" bson:"updatedAt"`
}

type DefaultUser struct {
	EnrollID    string    `json:"enrollID" bson:"enrollID" validate:"required"`
	Name        string    `json:"name" bson:"name" validate:"required"`
	Email       string    `json:"email" bson:"email" validate:"required"`
	Active      bool      `json:"active" bson:"active"`
	Password 	string 	  `json:"password" bson:"password" validate:"required"`
	SaltStored 	string    `json:"saltStored" bson:"saltStored"`
	Role 		string 	  `json:"role" bson:"role"`
	CreatedAt   time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt" bson:"updatedAt"`
}

type Role struct {
	Name        string    `json:"name" bson:"name"`
	Active      bool      `json:"active" bson:"active"`
	CreatedAt   time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt" bson:"updatedAt"`
}

type Sort struct {
    Field string `json:"field"`
    Value int  `json:"value"`
}