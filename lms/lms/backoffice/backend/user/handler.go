package main

import (
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"strconv"
	"strings"
	"time"
	"user/common"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Login for user login
func (svc *Service) Login(c *fiber.Ctx) error {
	var creds Credentials
	if err := c.BodyParser(&creds); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid request body"})
	}
	if creds.RefreshToken != "" {
		newAccessToken, userID, role, err := common.RefreshAccessToken(creds.RefreshToken)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Error refreshing access token", "error": err.Error()})
		}
		objectId, _ := primitive.ObjectIDFromHex(userID)
		if err := svc.storeTokens(objectId, newAccessToken, creds.RefreshToken, role); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Error storing tokens", "error": err.Error()})
		}
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"accessToken":  newAccessToken,
			"refreshToken": creds.RefreshToken,
			"userID":       userID,
		})
	}
	if err := validate.Struct(creds); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Missing required fields", "error": err.Error()})
	}
	// Authenticate user
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.USER_COLLECTION)
	userID, role, err := authenticateUser(creds.Username, creds.Password, collection)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Error authenticating user", "error": err.Error()})
	}
	if userID == primitive.NilObjectID {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Invalid username or password"})
	}
	// Generate tokens
	accessToken, refreshToken, err := common.GenerateTokens(userID.Hex())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Error generating tokens", "error": err.Error()})
	}
	// Store tokens in MongoDB
	if err := svc.storeTokens(userID, accessToken, refreshToken, role); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Error storing tokens", "error": err.Error()})
	}

	//Take permissions
	permissions := map[string]interface{}{
		"read": true, "write": true,
	}
	if role != svc.Config.ADMIN_ROLE {
		permissions = svc.GetPermission(c, userID.Hex())
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
		"role":         role,
		"userID":       userID,
		"permissions":  permissions,
	})
}

func (svc *Service) GetPermission(c *fiber.Ctx, userId string) map[string]interface{} {
	permissionMap := map[string]interface{}{
		"read":  false,
		"write": false,
	}
	filter := bson.M{"userId": userId}
	content, err := svc.getOneFromMongo(svc.Config.PERMISSION_COLLECTION, filter)
	if err != nil {
		return permissionMap
	}
	if content == nil {
		return permissionMap

	}
	return content.(map[string]interface{})
}

func authenticateUser(username string, password string, collection *mongo.Collection) (primitive.ObjectID, string, error) {
	filter := bson.M{
		strings.ToLower("email"): strings.ToLower(username),
		"active":                 bson.M{"$ne": false},
	}
	var userData map[string]interface{}
	err := collection.FindOne(context.TODO(), filter).Decode(&userData)
	if err != nil {
		return primitive.NilObjectID, "", err
	} else {
		saltStored, _ := userData["saltStored"].(string)
		valid := common.VerifyHashPassword(userData["password"].(string), password, 0, saltStored)
		if !valid {
			return primitive.NilObjectID, "", err
		}
	}
	id, _ := userData["_id"].(primitive.ObjectID)
	return id, userData["role"].(string), nil
}

func (svc *Service) storeTokens(userID primitive.ObjectID, accessToken, refreshToken string, role string) error {
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.TOKEN_COLLECTION)
	document := bson.M{
		"userId":       userID.Hex(),
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
		"role":         role,
		"exp":          time.Now().Add(time.Hour * 24 * 7).Unix(),
		"createdAt":    time.Now(),
	}
	err := svc.insertToken(document, collection)
	if err != nil {
		return err
	}
	return nil
}

func (svc *Service) insertToken(data interface{}, collection *mongo.Collection) error {
	_, err := collection.InsertOne(context.TODO(), data)
	if err != nil {
		return err
	}
	return nil
}

// CreateUser creates a new user
func (svc *Service) CreateUser(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	if role != svc.Config.ADMIN_ROLE {
		permissions := svc.GetPermission(c, c.Context().UserValue("userId").(string))
		if permissions["user"].(map[string]interface{})["write"] == false {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Access denied",
			})
		}
	}
	var user User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid data", "error": err.Error()})
	}
	passwordHash, saltStored := common.HashPassword(user.Password)
	user.Password = passwordHash
	user.SaltStored = saltStored
	// Validate the user struct
	if err := validate.Struct(user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Missing fields", "error": err.Error()})
	}
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.USER_COLLECTION)
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	user.Active = true
	var insertedID primitive.ObjectID
	if recordId, err := svc.insertOneToMongo(user, collection, user.EnrollID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "User creation failed", "error": err.Error()})
	} else {
		insertedID = recordId
	}
	svc.auditLog(user, c.Context().UserValue("userId").(string), "create")
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "User created successfully", "id": insertedID})
}

// CreateUser creates multiple users
func (svc *Service) CreateUsers(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	if role != svc.Config.ADMIN_ROLE {
		permissions := svc.GetPermission(c, c.Context().UserValue("userId").(string))
		if permissions["user"].(map[string]interface{})["write"] == false {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Access denied",
			})
		}
	}
	var users []User
	if err := c.BodyParser(&users); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid data", "error": err.Error()})
	}
	var userList []interface{}
	for _, user := range users {
		passwordHash, saltStored := common.HashPassword(user.Password)
		user.Password = passwordHash
		user.SaltStored = saltStored
		// Validate the user struct
		if err := validate.Struct(user); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Missing fields", "error": err.Error()})
		}
		user.CreatedAt = time.Now()
		user.UpdatedAt = time.Now()
		user.Active = true
		userList = append(userList, user)
	}
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.USER_COLLECTION)
	_,err:=collection.InsertMany(context.TODO(), userList)
	if err!=nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Users creation failed", "error": err.Error()})
	}
	svc.auditLog(userList, c.Context().UserValue("userId").(string), "create")
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "Users created successfully"})
}

// CreateDefaultUser creates a default new user with default password
func (svc *Service) CreateDefaultUser(c *fiber.Ctx) error {
	var user DefaultUser
	if err := c.BodyParser(&user); err != nil {
		return err
	}
	password, _ := common.GenerateRandomPassword(6)
	passwordHash, saltStored := common.HashPassword(password)
	user.Password = passwordHash
	user.SaltStored = saltStored
	// Validate the user struct
	if err := validate.Struct(user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Missing fields", "error": err.Error()})
	}
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.USER_COLLECTION)
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	user.Role = svc.Config.DEFAULT_ROLE
	user.Active = true
	var insertedID primitive.ObjectID
	if recordId, err := svc.insertOneToMongo(user, collection, "default"); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "User creation failed", "error": err.Error()})
	} else {
		insertedID = recordId
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "User created successfully", "credentials": fiber.Map{"username": user.Email, "password": password}, "id": insertedID})
}

func (svc *Service) BulkInsertUsers(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("No file uploaded")
	}
	src, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to open file")
	}
	defer src.Close()

	reader := csv.NewReader(src)

	// Read the headers and discard them
	_, err = reader.Read()
	if err != nil && err != io.EOF {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to read headers")
	}

	var users []interface{}
	for {
		record, err := reader.Read()
		if err != nil {
			if err == io.EOF {
				break
			}
			return c.Status(fiber.StatusInternalServerError).SendString("Failed to read CSV record")
		}

		passwordHash, saltStored := common.HashPassword(record[6])
		user := User{
			EnrollID:    record[0],
			Name:        record[1],
			Department:  record[2],
			Image:		 record[3],
			Designation: record[4],
			Description: record[5],
			Batch:       record[6],
			Email:       record[7],
			Password:    passwordHash,
			SaltStored:  saltStored,
			Phone:       record[9],
			DateOfBirth: record[10],
			BloodGroup:  record[11],
			Address:     record[12],
			Status:		record[13],
			Role:        record[14],
			Active:      true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}
		users = append(users, user)
	}

	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.USER_COLLECTION)
	err = svc.bulkInsertToMongo(collection, users)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to insert users into MongoDB")
	}
	svc.auditLog(file.Filename, c.Context().UserValue("userId").(string), "bulk insert")
	return c.SendString("Users inserted successfully")
}

func (svc *Service) Catalogue(c *fiber.Ctx) error {
	catalogueType := c.Query("type")
	var data interface{}
	if catalogueType == "user" {
		data = userCatalogue
	} else {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid type",
			"data":    make([]string, 0),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
		"data":    data,
	})
}

// GetUser retrieves a single user
func (svc *Service) GetUser(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	if role != svc.Config.ADMIN_ROLE {
		permissions := svc.GetPermission(c, c.Context().UserValue("userId").(string))
		if permissions["user"].(map[string]interface{})["read"] == false {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Access denied",
			})
		}
	}
	userID := c.Params("id")
	objectId, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid user ID", "error": err.Error()})
	}
	filter := bson.M{
		"$or": []bson.M{
			bson.M{"_id": objectId},
			bson.M{"enrollID": userID},
		},
		"active": true,
	}
	user, err := svc.getOneFromMongo(svc.Config.USER_COLLECTION, filter)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Failed to retrieve user", "error": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"data": user})
}

// GetUserProfile retrieves a user's profile
func (svc *Service) GetUserProfile(c *fiber.Ctx) error {
	userID := c.Params("id")
	objectId, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid user ID", "error": err.Error()})
	}
	filter := bson.M{
		"_id": objectId,
		"active": true,
	}
	user, err := svc.getOneFromMongo(svc.Config.USER_COLLECTION, filter)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Failed to retrieve user profile", "error": err.Error()})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"data": user})
}

// UpdateUser updates an existing user
func (svc *Service) UpdateUser(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	if role != svc.Config.ADMIN_ROLE {
		permissions := svc.GetPermission(c, c.Context().UserValue("userId").(string))
		if permissions["user"].(map[string]interface{})["write"] == false {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Access denied",
			})
		}
	}
	userID := c.Params("id")
	var updateData map[string]interface{}
	if err := c.BodyParser(&updateData); err != nil {
		return err
	}
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.USER_COLLECTION)
	if err := svc.updateOneInMongo(userID, updateData, collection); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Failed to update user", "error": err.Error()})
	}
	svc.auditLog(updateData, c.Context().UserValue("userId").(string), "update")
	return c.JSON(fiber.Map{"message": "User updated successfully"})
}

// DeleteUser deletes an existing user
func (svc *Service) DeleteUser(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	if role != svc.Config.ADMIN_ROLE {
		permissions := svc.GetPermission(c, c.Context().UserValue("userId").(string))
		if permissions["user"].(map[string]interface{})["write"] == false {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Access denied",
			})
		}
	}
	userID := c.Params("id")
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.USER_COLLECTION)
	if err := svc.deleteOneFromMongo(userID, collection); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Failed to delete user", "error": err.Error()})
	}
	content := map[string]interface{}{
		"userId": userID,
	}
	svc.auditLog(content, c.Context().UserValue("userId").(string), "delete")
	return c.JSON(fiber.Map{"message": "User deleted successfully"})
}

func (svc *Service) GetAllUsers(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	fmt.Println(role)
	if role != svc.Config.ADMIN_ROLE {
		permissions := svc.GetPermission(c, c.Context().UserValue("userId").(string))
		if permissions["user"].(map[string]interface{})["read"] == false {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Access denied",
			})
		}
	}
	collectionName := svc.Config.USER_COLLECTION
	offset, err := strconv.Atoi(c.Query("offset", "0"))
	if err != nil {
		return err
	}
	limit, err := strconv.Atoi(c.Query("limit", "50"))
	if err != nil {
		return err
	}
	filter := bson.M{"active": true}
	var requestBody struct {
		Filter bson.M `json:"filter"`
		Search string `json:"search"`
		GroupBy string `json:"groupBy"`
		SortBy  Sort `json:"sortBy"`
	}
	if err := c.BodyParser(&requestBody); err != nil {
		return err
	}
	for key, value := range requestBody.Filter {
		filter[key] = value
	}
	if requestBody.Search != "" {
		pattern := ".*" + requestBody.Search + ".*"
		filter["$or"] = []bson.M{bson.M{"name": bson.M{"$regex": pattern, "$options": "i"}}, bson.M{"email": bson.M{"$regex": pattern, "$options": "i"}},
			bson.M{"enrollID": bson.M{"$regex": pattern, "$options": "i"}}}
	}
	total, err := svc.countDocuments(collectionName, filter)
	if err != nil {
		return err
	}
	options := options.Find().SetSkip(int64(offset)).SetLimit(int64(limit))
	if requestBody.SortBy.Field != "" {
		options.SetSort(bson.D{{Key: requestBody.SortBy.Field, Value: requestBody.SortBy.Value}})
	}
	contents, err := svc.getAllFromMongo(collectionName, filter, options)
	if err != nil {
		return err
	}
	var groupedContents interface{}
	if requestBody.GroupBy != "" {
		groupedContents, err = svc.groupContents(contents, requestBody.GroupBy)
		if err != nil {
			return err
		}
	}
	pagination := fiber.Map{
		"total":  total,
		"offset": offset,
		"limit":  limit,
	}
	responseData := fiber.Map{
		"data":       contents,
		"pagination": pagination,
	}
	if requestBody.GroupBy != "" {
		responseData["data"] = groupedContents
	}
	return c.Status(fiber.StatusOK).JSON(responseData)
}

// groupContents groups the contents based on the specified field
func (svc *Service) groupContents(contents []interface{}, groupBy string) (interface{}, error) {
    groupedData := make(map[string][]interface{})
    for _, content := range contents {
        contentMap, ok := content.(map[string]interface{})
        if !ok {
            continue
        }
        fieldValue, ok := contentMap[groupBy].(string)
        if !ok {
            continue
        }
        if _, exists := groupedData[fieldValue]; !exists {
            groupedData[fieldValue] = make([]interface{}, 0)
        }
        groupedData[fieldValue] = append(groupedData[fieldValue], content)
    }
    return groupedData, nil
}

func (svc *Service) PostRole(c *fiber.Ctx) error {
	var role Role
	if err := c.BodyParser(&role); err != nil {
		return err
	}
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.ROLE_COLLECTION)
	role.CreatedAt = time.Now()
	role.UpdatedAt = time.Now()
	role.Active = true
	var insertedID primitive.ObjectID
	if recordId, err := svc.insertOneToMongo(role, collection, role.Name); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Role creation failed", "error": err.Error()})
	} else {
		insertedID = recordId
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "Role created successfully", "id": insertedID})
}

func (svc *Service) GetRoles(c *fiber.Ctx) error {
	collectionName := svc.Config.ROLE_COLLECTION
	options := options.Find()
	contents, err := svc.getAllFromMongo(collectionName, bson.M{}, options)
	if err != nil {
		return err
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data": contents,
	})
}

func ValidateToken(svc *Service) func(*fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Authorization token not valid"})
		}
		tokenString := authHeader[len("Bearer "):]
		var response map[string]interface{}
		var expiryTime int
		tokenCollection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.TOKEN_COLLECTION)
		err := tokenCollection.FindOne(context.TODO(), bson.M{"accessToken": tokenString}).Decode(&response)
		if err != nil {
			fmt.Println("error in finding token", err)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Authorization has been denied for this request"})
		}
		timeNow := time.Now()
		accessExpiry := response["createdAt"].(primitive.DateTime).Time()
		accessData := timeNow.Sub(accessExpiry)
		expiryTime = int(accessData.Minutes())
		if response["userId"] != "" && response["userId"] != nil && (expiryTime < 30) {
			c.Context().SetUserValue("userId", response["userId"])
			c.Context().SetUserValue("role", response["role"])
			log.Printf("authorization accepted: %v", response)
			c.Next()
		} else {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Authorization has been denied for this request"})
		}
		return nil
	}
}

func (svc *Service) auditLog(data interface{}, userId interface{}, action string) {
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.AUDIT_COLLECTION)
	auditData := map[string]interface{}{
		"data":   data,
		"action": action,
		"userId": userId,
	}
	collection.InsertOne(context.TODO(), auditData)
	return
}
