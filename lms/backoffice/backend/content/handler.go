package main

import (
	"bytes"
	"content/common"
	"context"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"mime"
	"mime/multipart"
	"net/smtp"
	"path/filepath"
	"strconv"
	"time"

	"cloud.google.com/go/storage"
	mgobson "github.com/globalsign/mgo/bson"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
)

// CreateContent creates a new content
func (svc *Service) CreateContent(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	approvalFlag := true
	if role != svc.Config.ADMIN_ROLE {
		permissions := svc.GetPermission(c, c.Context().UserValue("userId").(string))
		if permissions["modules"].(map[string]interface{})["course"].(map[string]interface{})["write"] == false {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Access denied",
			})
		}
		approvalFlag = false
	}
	collectionName := c.Params("collection")
	var err error
	if collectionName == "course" {
		err = svc.createCourse(c, collectionName, approvalFlag)
		fmt.Println(err)
	} else if collectionName == "chapter" {
		err = svc.createChapter(c, collectionName)
	}else  {
		err = svc.createLesson(c, collectionName)
	}
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Content creation failed", "error": err,
		})
	}
	return nil
}

// CreateCourse creates a new course
func (svc *Service) createCourse(c *fiber.Ctx, collectionName string, approvalFlag bool) error {
	var content Course
	if err := c.BodyParser(&content); err != nil {
		return err
	}
	content.ContentType = "course"
	// Validate the content struct
	if err := validate.Struct(content); err != nil {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Missing fields", "error": err.Error()})
	}
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(collectionName)
	content.CreatedAt = time.Now()
	content.UpdatedAt = time.Now()
	if !approvalFlag && content.Status == "published" {
		content.Status = "unPublished"
	}
	// else if content.Status == "" || content.Status == "draft" {
	// 	content.Status = "draft"
	// 	collection = svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.DRAFT_COLLECTION)
	// }
	content.CreatedBy = c.Context().UserValue("userId").(string)
	var insertedID primitive.ObjectID
	if recordId, err := svc.insertOneToMongo(content, collection, content.Name); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Course creation failed", "error": err.Error(),
		})
	} else {
		insertedID = recordId
	}
	//send approval request to admin
	if !approvalFlag {
		svc.sendAdminApproval(content, insertedID.Hex())
		svc.sendContentNotification(c.Context().UserValue("userId").(string), "is waiting for your approval", content, svc.Config.ADMIN_ROLE)
	}
	svc.auditLog(content,c.Context().UserValue("userId").(string),"create")
	c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Course created successfully",
		"id":      insertedID,
	})
	return nil
}

// CreateChapter creates a new chapter
func (svc *Service) createChapter(c *fiber.Ctx, collectionName string) error {
	var content Chapter
	if err := c.BodyParser(&content); err != nil {
		return err
	}
	content.ContentType = "chapter"
	// Validate the content struct
	if err := validate.Struct(content); err != nil {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Missing fields", "error": err.Error()})
	}
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(collectionName)
	content.CreatedAt = time.Now()
	content.UpdatedAt = time.Now()
	if content.Status == "" {
		content.Status = "draft"
	}
	content.CreatedBy = c.Context().UserValue("userId").(string)
	var insertedID primitive.ObjectID
	if recordId, err := svc.insertOneToMongo(content, collection, content.Name); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Chapter creation failed", "error": err.Error(),
		})
	} else {
		insertedID = recordId
	}
	courseCollection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.COURSE_COLLECTION)
	objectIdCourse, _ := primitive.ObjectIDFromHex(content.CourseId)
	coursefilter := bson.M{"_id": objectIdCourse}
	update := bson.M{"$inc": bson.M{"chaptersCount": 1}}
	_, err := courseCollection.UpdateOne(context.TODO(), coursefilter, update)
	if err != nil {
		fmt.Println(err)
	}
	svc.auditLog(content,c.Context().UserValue("userId").(string),"create")
	c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Chapter created successfully",
		"id":      insertedID,
	})
	return nil
}

// CreateChapter creates a new lesson
func (svc *Service) createLesson(c *fiber.Ctx, collectionName string) error {
	var content Lesson
	if err := c.BodyParser(&content); err != nil {
		return err
	}
	content.ContentType = "lesson"
	// Validate the content struct
	if err := validate.Struct(content); err != nil {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Missing fields", "error": err.Error()})
	}
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(collectionName)
	content.CreatedAt = time.Now()
	content.UpdatedAt = time.Now()
	if content.Status == "" {
		content.Status = "draft"
	}
	content.CreatedBy = c.Context().UserValue("userId").(string)
	var insertedID primitive.ObjectID
	if recordId, err := svc.insertOneToMongo(content, collection, content.Name); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Lesson creation failed", "error": err.Error(),
		})
	} else {
		insertedID = recordId
	}
	courseCollection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.CHAPTER_COLLECTION)
	objectIdCourse, _ := primitive.ObjectIDFromHex(content.ChapterId)
	coursefilter := bson.M{"_id": objectIdCourse}
	update := bson.M{"$inc": bson.M{"lessonsCount": 1}}
	_, err := courseCollection.UpdateOne(context.TODO(), coursefilter, update)
	if err != nil {
		fmt.Println(err)
	}
	svc.auditLog(content,c.Context().UserValue("userId").(string),"create")
	c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Lesson created successfully",
		"id":      insertedID,
	})
	return nil
}

func (svc *Service) sendAdminApprovalUpdate(data interface{}, contentId string) {
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.APPROVAL_COLLECTION)
	mapData, _ := data.(map[string]interface{})
	objectId, _ := primitive.ObjectIDFromHex(mapData["createdBy"].(string))
	filter := bson.M{"_id": objectId}
	content, _ := svc.getOneFromMongo(svc.Config.USER_COLLECTION, filter)
	approvalData := map[string]interface{}{
		"details":       data,
		"contentId":     contentId,
		"requestedBy":   content,
		"contentStatus": "pending",
	}
	if _, err := svc.insertOneToMongo(approvalData, collection, mapData["name"].(string)); err != nil {
		log.Println(err, "Approval request was not sent")
	}
}

func (svc *Service) sendAdminApproval(data Course, contentId string) {
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.APPROVAL_COLLECTION)
	objectId, _ := primitive.ObjectIDFromHex(data.CreatedBy)
	filter := bson.M{"_id": objectId}
	userData, _ := svc.getOneFromMongo(svc.Config.USER_COLLECTION, filter)
	approvalData := map[string]interface{}{
		"details":       data,
		"contentId":     contentId,
		"requestedBy":   userData,
		"contentStatus": "pending",
	}
	if _, err := svc.insertOneToMongo(approvalData, collection, data.Name); err != nil {
		log.Println(err, "Approval request was not sent")
	}
	// userDataMap,_:=userData.(map[string]interface{})
	// requesterName,_:=userDataMap["name"].(string)
	// htmlContentData := struct {
	// 	CreatedBy       string
	// 	Department string
	// 	Semester      string
	// 	CourseCode        string
	// 	Name string
	// 	Description string
	// 	ApprovalURL string
	// }{
	// 	CreatedBy:       requesterName,
	// 	Department: data.Department,
	// 	Semester:      data.Semester,
	// 	CourseCode:        data.CourseCode,
	// 	Name: data.Name,
	// 	Description:  data.Description,
	// 	ApprovalURL: svc.Config.APPROVAL_URL,
	// }
	// tmpl, err := template.New("adminContentApproval").Parse(adminContentApproval)
	// if err != nil {
	// 	log.Fatal(err)
	// }
	// var tpl bytes.Buffer
	// if err := tmpl.Execute(&tpl, htmlContentData); err != nil {
	// 	log.Fatal(err)
	// }
	// go svc.SentEmail([]string{"a4akshaykn@gmail.com"},tpl.String(),"Content Approval","text/html")
}

func (svc *Service) sendContentNotification(userId string, message string, content interface{}, role string) {
	//TODO : EVERY 20 days the notifications will be cleared from DB
	notificationCollection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.NOTIFICATION_COLLECTION)
	objectId, _ := primitive.ObjectIDFromHex(userId)
	filter := bson.M{"_id": objectId}
	userDetails, _ := svc.getOneFromMongo(svc.Config.USER_COLLECTION, filter)
	userDetailsMap, _ := userDetails.(map[string]interface{})
	userData := map[string]interface{}{
		"email":      userDetailsMap["email"],
		"name":       userDetailsMap["name"],
		"department": userDetailsMap["department"],
		"enrollID":   userDetailsMap["enrollID"],
	}
	notificationData := map[string]interface{}{
		"message":     userDetailsMap["name"].(string) + " " + message,
		"userDetails": userData,
		"details":     content,
		"to":          role,
	}
	if _, err := svc.insertOneToMongo(notificationData, notificationCollection, ""); err != nil {
		log.Println(err, "Notification was not sent")
	}
}

func (svc *Service) GetContentNotifications(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	userId := c.Context().UserValue("userId").(string)
	var filter bson.M
	if role == svc.Config.PROFESSOR_ROLE {
		filter = bson.M{"to": svc.Config.PROFESSOR_ROLE, "details.createdBy": userId}
	} else {
		filter = bson.M{"to": svc.Config.ADMIN_ROLE}
	}
	collectionName := svc.Config.NOTIFICATION_COLLECTION
	offset, err := strconv.Atoi(c.Query("offset", "0"))
	if err != nil {
		return err
	}
	limit, err := strconv.Atoi(c.Query("limit", "50"))
	if err != nil {
		return err
	}
	total, err := svc.countDocuments(collectionName, filter)
	if err != nil {
		return err
	}
	options := options.Find().SetSkip(int64(offset)).SetLimit(int64(limit))
	notifications, err := svc.getAllFromMongo(collectionName, filter, options)
	if err != nil {
		return err
	}
	pagination := fiber.Map{
		"total":  total,
		"offset": offset,
		"limit":  limit,
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data":       notifications,
		"pagination": pagination,
	})
}

func (svc *Service) CreateBucket(c *fiber.Ctx) error {
	ctx := context.Background()
	projectID := svc.Config.GCP_PROJECTID
	client := svc.getGCPClient()
	bucketName := c.Query("name")
	if err := client.Bucket(bucketName).Create(ctx, projectID, nil); err != nil {
		fmt.Println(err)
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to create bucket")
	}
	// if err := client.Bucket(bucketName).ACL().Set(ctx, storage.AllUsers, storage.RoleReader); err != nil {
	// 	return c.Status(fiber.StatusInternalServerError).SendString("Failed to set bucket ACL")
	// }
	return c.SendString("Bucket created successfully")
}

func (svc *Service) DeleteBucket(c *fiber.Ctx) error {
	ctx := context.Background()
	client := svc.getGCPClient()
	bucketName := c.Query("name")
	bucket := client.Bucket(bucketName)
	if err := bucket.Delete(ctx); err != nil {
		return err
	}
	return c.SendString("Bucket created successfully")
}

func (svc *Service) UploadImage(c *fiber.Ctx) error {
	fileObject, err := c.FormFile("file")
	imagetType := c.Query("type")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "image upload failed"})
	}
	fileName := fmt.Sprintf("%s/%s%s", imagetType, mgobson.NewObjectId().Hex(), filepath.Ext(fileObject.Filename))
	var fileLocation string
	fileLocation, err = svc.gcpUpload(fileObject, fileName)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "image upload failed"})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "success", "data": fileLocation})

}

func (svc *Service) gcpUpload(file *multipart.FileHeader, fileName string) (string, error) {
	ctx := context.Background()
	fileContent, err := file.Open()
	if err != nil {
		return "", err
	}
	defer fileContent.Close()
	contentType := mime.TypeByExtension(filepath.Ext(fileName))
	client := svc.getGCPClient()
	bucketName := svc.Config.GCP_BUCKET
	objectName := fileName
	obj := client.Bucket(bucketName).Object(objectName)
	wc := obj.NewWriter(ctx)
	_, err = io.Copy(wc, fileContent)
	if err != nil {
		fmt.Println("Error copying file content:", err)
		return "", err
	}
	wc.ContentType = contentType
	if err := wc.Close(); err != nil {
		return "", err
	}
	fileLocation := "https://storage.googleapis.com/" + bucketName + "/" + objectName
	// if err != nil {
	// 	fmt.Println(err)
	// }

	return fileLocation, nil

}

func (svc *Service) getGCPClient() *storage.Client {
	data := map[string]interface{}{
		"type":         svc.Config.GCP_TYPE,
		"client_email": svc.Config.GCP_CLIENT_MAIL,
		"private_key":  svc.Config.GCP_PRIVATE_KEY,
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil
	}
	ctx := context.Background()
	creds, err := google.CredentialsFromJSON(ctx, jsonData, "https://www.googleapis.com/auth/cloud-platform")
	if err != nil {
		fmt.Println("Error creating credentials:", err)
	}
	client, err := storage.NewClient(ctx, option.WithCredentials(creds))
	if err != nil {
		fmt.Println(err, "lllllll")
		return nil
	}
	return client
}

// GetAllContents gets all contents
func (svc *Service) GetAllContents(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	if role != svc.Config.ADMIN_ROLE {
		permissions := svc.GetPermission(c, c.Context().UserValue("userId").(string))
		if permissions["modules"].(map[string]interface{})["course"].(map[string]interface{})["read"] == false {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Access denied",
			})
		}
	}
	collectionName := svc.Config.COURSE_COLLECTION
	offset, err := strconv.Atoi(c.Query("offset", "0"))
	if err != nil {
		return err
	}
	limit, err := strconv.Atoi(c.Query("limit", "50"))
	if err != nil {
		return err
	}
	filter := bson.M{"status": bson.M{"$nin": []string{"deleted", "draft"}}}
	var requestBody struct {
		Filter  bson.M `json:"filter"`
		Search  string `json:"search"`
		GroupBy string `json:"groupBy"`
		SortBy  Sort `json:"sortBy"`
	}
	if err := c.BodyParser(&requestBody); err != nil {
		return err
	}
	for key, value := range requestBody.Filter {
		filter[key] = value
		if key == "status" && value == "draft" {
			filter["createdBy"] = c.Context().UserValue("userId").(string)
		}
	}
	if requestBody.Search != "" {
		pattern := ".*" + requestBody.Search + ".*"
		filter["$or"] = []bson.M{bson.M{"name": bson.M{"$regex": pattern, "$options": "i"}}, bson.M{"courseCode": bson.M{"$regex": pattern, "$options": "i"}}}
	}
	total, err := svc.countDocuments(collectionName, filter)
	if err != nil {
		fmt.Println(err)
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




func (svc *Service) GetAllContentDrafts(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	if role != svc.Config.ADMIN_ROLE {
		permissions := svc.GetPermission(c, c.Context().UserValue("userId").(string))
		if permissions["modules"].(map[string]interface{})["course"].(map[string]interface{})["read"] == false {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Access denied",
			})
		}
	}
	collectionName := svc.Config.DRAFT_COLLECTION
	offset, err := strconv.Atoi(c.Query("offset", "0"))
	if err != nil {
		return err
	}
	limit, err := strconv.Atoi(c.Query("limit", "50"))
	if err != nil {
		return err
	}
	filter := bson.M{"status": "draft", "createdBy": c.Context().UserValue("userId").(string)}
	total, err := svc.countDocuments(collectionName, filter)
	if err != nil {
		return err
	}
	options := options.Find().SetSkip(int64(offset)).SetLimit(int64(limit))
	contents, err := svc.getAllFromMongo(collectionName, filter, options)
	if err != nil {
		return err
	}
	pagination := fiber.Map{
		"total":  total,
		"offset": offset,
		"limit":  limit,
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data":       contents,
		"pagination": pagination,
	})
}

func (svc *Service) ApproveContent(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	if role != svc.Config.ADMIN_ROLE {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Access denied",
		})
	}
	var requestData map[string]interface{}
	if err := c.BodyParser(&requestData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Content approval failed",
		})
	}
	contentId, ok := requestData["contentId"].(string)
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Content id  is invalid",
		})
	}
	approved, ok := requestData["approval"]
	if !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Approval value is invalid",
		})
	}
	objectId, _ := primitive.ObjectIDFromHex(contentId)
	contentFilter := bson.M{"_id": objectId}
	content, _ := svc.getOneFromMongo(svc.Config.COURSE_COLLECTION, contentFilter)
	contentMap, _ := content.(map[string]interface{})
	htmlContentData := struct {
		CreatedBy interface{}
		Name      interface{}
		Status    string
	}{
		CreatedBy: "",
		Name:      "",
		Status:    "",
	}
	if approved == true {
		contentCollection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.COURSE_COLLECTION)
		dataToUpdate := map[string]interface{}{
			"status": "published",
		}
		if err := svc.updateOneInMongo(contentId, dataToUpdate, contentCollection); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Content update failed",
			})
		}
		dataToUpdate = map[string]interface{}{
			"contentStatus": "approved",
			"comment":       requestData["comment"],
		}
		approvalCollection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.APPROVAL_COLLECTION)
		filter := bson.M{"contentId": contentId, "contentStatus": "pending"}
		update := bson.M{"$set": dataToUpdate}
		_, err := approvalCollection.UpdateOne(context.TODO(), filter, update)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Status update failed",
			})
		}
		//send notification saying approved to professor who created course
		htmlContentData.Name = contentMap["name"]
		professorObjectId, _ := primitive.ObjectIDFromHex(contentMap["createdBy"].(string))
		userData, _ := svc.getOneFromMongo(svc.Config.USER_COLLECTION, bson.M{"_id": professorObjectId})
		userDataMap, _ := userData.(map[string]interface{})
		htmlContentData.CreatedBy = userDataMap["name"]
		htmlContentData.Status = "Approved"
		svc.sendContentNotification(c.Context().UserValue("userId").(string), "has approved your content", content, svc.Config.PROFESSOR_ROLE)
		tmpl, err := template.New("professorContentApproval").Parse(professorContentApproval)
		if err != nil {
			log.Fatal(err)
		}
		var tpl bytes.Buffer
		if err := tmpl.Execute(&tpl, htmlContentData); err != nil {
			log.Fatal(err)
		}
		go svc.SentEmail([]string{userDataMap["email"].(string)}, tpl.String(), "Content Approved", "text/html")
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Content approved"})
	} else {
		dataToUpdate := map[string]interface{}{
			"contentStatus": "rejected",
			"comment":       requestData["comment"],
		}
		approvalCollection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.APPROVAL_COLLECTION)
		filter := bson.M{"contentId": contentId, "contentStatus": "pending"}
		update := bson.M{"$set": dataToUpdate}
		_, err := approvalCollection.UpdateOne(context.TODO(), filter, update)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Status update failed",
			})
		}
		//send notification saying rejected to professro who created the course
		htmlContentData.Name = contentMap["name"]
		professorObjectId, _ := primitive.ObjectIDFromHex(contentMap["createdBy"].(string))
		userData, _ := svc.getOneFromMongo(svc.Config.USER_COLLECTION, bson.M{"_id": professorObjectId})
		userDataMap, _ := userData.(map[string]interface{})
		htmlContentData.CreatedBy = userDataMap["name"]
		htmlContentData.Status = "Rejected"
		svc.sendContentNotification(c.Context().UserValue("userId").(string), "has rejected your content", content, svc.Config.PROFESSOR_ROLE)
		tmpl, err := template.New("professorContentApproval").Parse(professorContentApproval)
		if err != nil {
			log.Fatal(err)
		}
		var tpl bytes.Buffer
		if err := tmpl.Execute(&tpl, htmlContentData); err != nil {
			log.Fatal(err)
		}
		go svc.SentEmail([]string{userDataMap["email"].(string)}, tpl.String(), "Content Rejected", "text/html")
		svc.auditLog(content,c.Context().UserValue("userId").(string),"approval")
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Content rejected"})
	}
}

func (svc *Service) GetAllContentApprovals(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	filter := bson.M{}
	if role != svc.Config.ADMIN_ROLE {
		objectUserId, _ := primitive.ObjectIDFromHex(c.Context().UserValue("userId").(string))
		filter = bson.M{"requestedBy." + "_id": objectUserId}
	}
	collectionName := svc.Config.APPROVAL_COLLECTION
	offset, err := strconv.Atoi(c.Query("offset", "0"))
	if err != nil {
		return err
	}
	limit, err := strconv.Atoi(c.Query("limit", "50"))
	if err != nil {
		return err
	}
	total, err := svc.countDocuments(collectionName, filter)
	if err != nil {
		fmt.Println(err)
		return err
	}
	options := options.Find().SetSkip(int64(offset)).SetLimit(int64(limit))
	contents, err := svc.getAllFromMongo(collectionName, filter, options)
	if err != nil {
		return err
	}
	pagination := fiber.Map{
		"total":  total,
		"offset": offset,
		"limit":  limit,
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data":       contents,
		"pagination": pagination,
	})
}

// GetAllChapters gets all chapters
func (svc *Service) GetAllChapters(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	if role != svc.Config.ADMIN_ROLE {
		permissions := svc.GetPermission(c, c.Context().UserValue("userId").(string))
		if permissions["modules"].(map[string]interface{})["course"].(map[string]interface{})["read"] == false {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Access denied",
			})
		}
	}
	courseId := c.Query("courseId")
	filter := bson.M{"status": bson.M{"$nin": []string{"deleted", "draft"}}}
	var requestBody struct {
		Filter bson.M `json:"filter"`
		Search string `json:"search"`
		GroupBy string `json:"groupBy"`
		SortBy  Sort `json:"sortBy"`
	}
	offset, err := strconv.Atoi(c.Query("offset", "0"))
	if err != nil {
		return err
	}
	limit, err := strconv.Atoi(c.Query("limit", "50"))
	if err != nil {
		return err
	}
	if err := c.BodyParser(&requestBody); err != nil {
		return err
	}
	for key, value := range requestBody.Filter {
		filter[key] = value
		if key == "status" && value == "draft" {
			filter["createdBy"] = c.Context().UserValue("userId").(string)
		}
	}
	filter["courseId"] = courseId
	if requestBody.Search != "" {
		pattern := ".*" + requestBody.Search + ".*"
		filter["name"] = bson.M{"$regex": pattern, "$options": "i"}
	}
	total, err := svc.countDocuments(svc.Config.CHAPTER_COLLECTION, filter)
	if err != nil {
		return err
	}
	options := options.Find().SetSkip(int64(offset)).SetLimit(int64(limit))
	if requestBody.SortBy.Field != "" {
		options.SetSort(bson.D{{Key: requestBody.SortBy.Field, Value: requestBody.SortBy.Value}})
	}
	contents, err := svc.getAllFromMongo(svc.Config.CHAPTER_COLLECTION, filter, options)
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

// GetAllChapters gets all lessons
func (svc *Service) GetAllLessons(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	if role != svc.Config.ADMIN_ROLE {
		permissions := svc.GetPermission(c, c.Context().UserValue("userId").(string))
		if permissions["modules"].(map[string]interface{})["course"].(map[string]interface{})["read"] == false {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Access denied",
			})
		}
	}
	courseId := c.Query("chapterId")
	filter := bson.M{"status": bson.M{"$nin": []string{"deleted", "draft"}}}
	var requestBody struct {
		Filter bson.M `json:"filter"`
		Search string `json:"search"`
		GroupBy string `json:"groupBy"`
		SortBy  Sort `json:"sortBy"`
	}
	offset, err := strconv.Atoi(c.Query("offset", "0"))
	if err != nil {
		return err
	}
	limit, err := strconv.Atoi(c.Query("limit", "50"))
	if err != nil {
		return err
	}
	if err := c.BodyParser(&requestBody); err != nil {
		return err
	}
	for key, value := range requestBody.Filter {
		filter[key] = value
		if key == "status" && value == "draft" {
			filter["createdBy"] = c.Context().UserValue("userId").(string)
		}
	}
	filter["chapterId"] = courseId
	if requestBody.Search != "" {
		pattern := ".*" + requestBody.Search + ".*"
		filter["name"] = bson.M{"$regex": pattern, "$options": "i"}
	}
	total, err := svc.countDocuments(svc.Config.LESSON_COLLECTION, filter)
	if err != nil {
		return err
	}
	options := options.Find().SetSkip(int64(offset)).SetLimit(int64(limit))
	if requestBody.SortBy.Field != "" {
		options.SetSort(bson.D{{Key: requestBody.SortBy.Field, Value: requestBody.SortBy.Value}})
	}
	contents, err := svc.getAllFromMongo(svc.Config.LESSON_COLLECTION, filter, options)
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

func (svc *Service) GetAllChapterDrafts(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	if role != svc.Config.ADMIN_ROLE {
		permissions := svc.GetPermission(c, c.Context().UserValue("userId").(string))
		if permissions["modules"].(map[string]interface{})["course"].(map[string]interface{})["read"] == false {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Access denied",
			})
		}
	}
	courseId := c.Query("courseId")
	filter := bson.M{"status": "draft"}
	if courseId != "" {
		filter["courseId"] = courseId
	}
	offset, err := strconv.Atoi(c.Query("offset", "0"))
	if err != nil {
		return err
	}
	limit, err := strconv.Atoi(c.Query("limit", "50"))
	if err != nil {
		return err
	}
	total, err := svc.countDocuments(svc.Config.CHAPTER_COLLECTION, filter)
	if err != nil {
		return err
	}
	options := options.Find().SetSkip(int64(offset)).SetLimit(int64(limit))
	contents, err := svc.getAllFromMongo(svc.Config.CHAPTER_COLLECTION, filter, options)
	if err != nil {
		return err
	}
	pagination := fiber.Map{
		"total":  total,
		"offset": offset,
		"limit":  limit,
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data":       contents,
		"pagination": pagination,
	})
}

func (svc *Service) GetAllLessonsDrafts(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	if role != svc.Config.ADMIN_ROLE {
		permissions := svc.GetPermission(c, c.Context().UserValue("userId").(string))
		if permissions["modules"].(map[string]interface{})["course"].(map[string]interface{})["read"] == false {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Access denied",
			})
		}
	}
	courseId := c.Query("chapterId")
	filter := bson.M{"status": "draft"}
	if courseId != "" {
		filter["chapterId"] = courseId
	}
	offset, err := strconv.Atoi(c.Query("offset", "0"))
	if err != nil {
		return err
	}
	limit, err := strconv.Atoi(c.Query("limit", "50"))
	if err != nil {
		return err
	}
	total, err := svc.countDocuments(svc.Config.LESSON_COLLECTION, filter)
	if err != nil {
		return err
	}
	options := options.Find().SetSkip(int64(offset)).SetLimit(int64(limit))
	contents, err := svc.getAllFromMongo(svc.Config.LESSON_COLLECTION, filter, options)
	if err != nil {
		return err
	}
	pagination := fiber.Map{
		"total":  total,
		"offset": offset,
		"limit":  limit,
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data":       contents,
		"pagination": pagination,
	})
}

// GetContent gets a single content
func (svc *Service) GetContent(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	if role != svc.Config.ADMIN_ROLE {
		permissions := svc.GetPermission(c, c.Context().UserValue("userId").(string))
		if permissions["modules"].(map[string]interface{})["course"].(map[string]interface{})["read"] == false {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Access denied",
			})
		}
	}
	collectionName := c.Params("collection")
	contentID := c.Params("id")
	objectId, _ := primitive.ObjectIDFromHex(contentID)
	filter := bson.M{"_id": objectId}
	content, err := svc.getOneFromMongo(collectionName, filter)
	if err != nil {
		return err
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"data": content})
}

// UpdateContent updates a single content
func (svc *Service) UpdateContent(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	collectionName := c.Params("collection")
	id := c.Params("id")
	var currentContentData map[string]interface{}
	if role != svc.Config.ADMIN_ROLE {
		permissions := svc.GetPermission(c, c.Context().UserValue("userId").(string))
		if permissions["modules"].(map[string]interface{})["course"].(map[string]interface{})["write"] == false {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Access denied",
			})
		} else {
			objectId, _ := primitive.ObjectIDFromHex(id)
			filter := bson.M{"_id": objectId}
			content, err := svc.getOneFromMongo(collectionName, filter)
			document, ok := content.(map[string]interface{})
			if err != nil || !ok || (document["createdBy"] != c.Context().UserValue("userId").(string) && !common.FindString(document["professorId"].(primitive.A), c.Context().UserValue("userId").(string))) {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"message": "Access denied",
				})
			}
			currentContentData = document
		}
	}
	var content map[string]interface{}
	if err := c.BodyParser(&content); err != nil {
		return err
	}
	if currentContentData["status"] == "unPublished" && content["status"] == "published" && content["contentType"] == "course" {
		content["status"] = "unPublished"
		svc.sendAdminApprovalUpdate(content, id)
		svc.sendContentNotification(c.Context().UserValue("userId").(string), "is waiting for your approval", content, svc.Config.ADMIN_ROLE)
	}
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(collectionName)
	if err := svc.updateOneInMongo(id, content, collection); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Content update failed",
		})
	}
	draftCollection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.DRAFT_COLLECTION)
	if err := svc.deleteOneFromMongo(id, draftCollection); err != nil {
		fmt.Println(err)
	}
	svc.auditLog(content,c.Context().UserValue("userId").(string),"update")
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Content updated successfully",
	})
}

// DeleteContent deletes a single content
func (svc *Service) DeleteContent(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	if role != svc.Config.ADMIN_ROLE {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Access denied",
		})
	}
	id := c.Params("id")
	collectionName := c.Params("collection")
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(collectionName)
	if err := svc.deleteOneFromMongo(id, collection); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Content deletion failed",
		})
	}
	content:=map[string]interface{}{
		"contentId":id,
		"module":collectionName,
	}
	svc.auditLog(content,c.Context().UserValue("userId").(string),"delete")
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Content deleted successfully",
	})
}

func (svc *Service) Catalogue(c *fiber.Ctx) error {
	catalogueType := c.Query("type")
	var data interface{}
	if catalogueType == "course" {
		data = courseCatalogue
	} else if catalogueType == "chapter" {
		data = chapterCatalogue
	}else if catalogueType == "lesson" {
		data = lessonCatalogue
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

func (svc *Service) GetMasterData(c *fiber.Ctx) error {
	// masterdataCollection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.MASTERDATA_COLLECTION)
	contents, err := svc.getAllFromMongo(svc.Config.MASTERDATA_COLLECTION, bson.M{}, nil)
	if err != nil {
		return err
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message":"success","data":contents})
}

func (svc *Service) CreateMasterData(c *fiber.Ctx) error {
    var requestData []map[string]interface{}
    if err := c.BodyParser(&requestData); err != nil {
        return err
    }
    var bulkWriteModels []mongo.WriteModel
    for _, item := range requestData {
        name, ok := item["name"].(string)
        if !ok {
            return fmt.Errorf("name field not found or invalid")
        }
        filter := bson.M{"name": name}
        update := bson.M{"$set": item}
        model := mongo.NewUpdateOneModel().SetFilter(filter).SetUpdate(update).SetUpsert(true)
        bulkWriteModels = append(bulkWriteModels, model)
    }
    bulkResult, err := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.MASTERDATA_COLLECTION).BulkWrite(context.TODO(), bulkWriteModels)
    if err != nil {
        return err
    }
    return c.Status(fiber.StatusOK).JSON(fiber.Map{
        "message": "success",
        "result":  bulkResult,
    })
}


func (svc *Service) Dashboard(c *fiber.Ctx) error {
	courseCollection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.COURSE_COLLECTION)
	userCollection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.USER_COLLECTION)
	chapterCollection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.CHAPTER_COLLECTION)
	draftCollection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.DRAFT_COLLECTION)

	// Total number of courses
	totalCourses, err := courseCollection.CountDocuments(context.TODO(), bson.M{})
	if err != nil {
		fmt.Println(err, 1)
		return err
	}

	// Total number of drafts
	totalDrafts, err := draftCollection.CountDocuments(context.TODO(), bson.M{})
	if err != nil {
		fmt.Println(err, 2)
		return err
	}

	// Total number of chapters per course
	chaptersPerCoursePipeline := bson.D{
		{"$group", bson.D{{"_id", "$courseId"}, {"count", bson.D{{"$sum", 1}}}}},
	}
	chaptersPerCourseCursor, err := chapterCollection.Aggregate(context.TODO(), mongo.Pipeline{chaptersPerCoursePipeline})
	if err != nil {
		fmt.Println(err, 3)
		return err
	}
	chaptersPerCourse := []fiber.Map{}
	for chaptersPerCourseCursor.Next(context.TODO()) {
		var document map[string]interface{}
		if err = chaptersPerCourseCursor.Decode(&document); err != nil {
			continue
		}
		objectId, _ := primitive.ObjectIDFromHex(document["_id"].(string))
		filter := bson.M{"_id": objectId}
		courseContent, err := svc.getOneFromMongo(svc.Config.COURSE_COLLECTION, filter)
		if err != nil {
			continue
		}
		if courseContent, ok := courseContent.(map[string]interface{}); ok {
			document["course"] = courseContent["name"]
		}
		delete( document , "_id")
		chaptersPerCourse = append(chaptersPerCourse, document)
	}

	// Total number of professors
	totalProfessors, err := userCollection.CountDocuments(context.TODO(), bson.M{"role": "professor"})
	if err != nil {
		fmt.Println(err, 5)
		return err
	}
	// Total number of students
	totalStudents, err := userCollection.CountDocuments(context.TODO(), bson.M{"role": "student"})
	if err != nil {
		fmt.Println(err)
		return err
	}
	// Total number of published courses
	totalPublishedCourses, err := courseCollection.CountDocuments(context.TODO(), bson.M{"status": "published"})
	if err != nil {
		fmt.Println(err)
		return err
	}
	// Total number of unpublished courses
	totalUnpublishedCourses, err := courseCollection.CountDocuments(context.TODO(), bson.M{"status": "unPublished"})
	if err != nil {
		fmt.Println(err)
		return err
	}
	// Total number of deleted courses
	totalDeletedCourses, err := courseCollection.CountDocuments(context.TODO(), bson.M{"status": "deleted"})
	if err != nil {
		fmt.Println(err)
		return err
	}
	// Get total professors per department
	professorsPerDepartmentPipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.D{{Key: "role", Value: "professor"}}}},
		{{Key: "$group", Value: bson.D{{Key: "_id", Value: "$department"}, {"count", bson.D{{Key: "$sum", Value: 1}}}}}},
	}
	professorsPerDepartmentCursor, err := userCollection.Aggregate(context.TODO(), professorsPerDepartmentPipeline)
	if err != nil {
		fmt.Println(err)
		return err
	}
	professorsPerDepartment := []fiber.Map{}
	for professorsPerDepartmentCursor.Next(context.TODO()) {
		var document map[string]interface{}
		if err = professorsPerDepartmentCursor.Decode(&document); err != nil {
			continue
		}
		document["department"] = document["_id"]
		delete(document, "_id")
		professorsPerDepartment = append(professorsPerDepartment, document)
	}

	// Get total students per department
	studentsPerDepartmentPipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.D{{Key: "role", Value: "student"}}}},
		{{Key: "$group", Value: bson.D{{Key: "_id", Value: "$department"}, {"count", bson.D{{Key: "$sum", Value: 1}}}}}},
	}
	studentsPerDepartmentCursor, err := userCollection.Aggregate(context.TODO(), studentsPerDepartmentPipeline)
	if err != nil {
		fmt.Println(err)
		return err
	}
	studentsPerDepartment := []fiber.Map{}
	for studentsPerDepartmentCursor.Next(context.TODO()) {
		var document map[string]interface{}
		if err = studentsPerDepartmentCursor.Decode(&document); err != nil {
			continue
		}
		document["department"] = document["_id"]
		delete(document, "_id")
		studentsPerDepartment = append(studentsPerDepartment, document)
	}
	// Get total students per batch
	studentsPerBatchPipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.D{{Key: "role", Value: "student"}}}},
		{{Key: "$group", Value: bson.D{{Key: "_id", Value: "$batch"}, {"count", bson.D{{Key: "$sum", Value: 1}}}}}},
	}
	studentsPerBatchCursor, err := userCollection.Aggregate(context.TODO(), studentsPerBatchPipeline)
	if err != nil {
		fmt.Println(err)
		return err
	}
	studentsPerBatch := []fiber.Map{}
	for studentsPerBatchCursor.Next(context.TODO()) {
		var document map[string]interface{}
		if err = studentsPerBatchCursor.Decode(&document); err != nil {
			continue
		}
		document["batch"] = document["_id"]
		delete(document, "_id")
		studentsPerBatch = append(studentsPerBatch, document)
	}
	// Get total courses per department
	coursesPerDepartmentPipeline := mongo.Pipeline{
		{{Key: "$group", Value: bson.D{{Key: "_id", Value: "$department"}, {"count", bson.D{{Key: "$sum", Value: 1}}}}}},
	}
	coursesPerDepartmentCursor, err := courseCollection.Aggregate(context.TODO(), coursesPerDepartmentPipeline)
	if err != nil {
		fmt.Println(err)
		return err
	}
	coursesPerDepartment := []fiber.Map{}
	for coursesPerDepartmentCursor.Next(context.TODO()) {
		var document map[string]interface{}
		if err = coursesPerDepartmentCursor.Decode(&document); err != nil {
			continue
		}
		document["depatment"] = document["_id"]
		delete(document, "_id")
		coursesPerDepartment = append(coursesPerDepartment, document)
	}

	// Get total courses per batch
	coursesPerBatchPipeline := mongo.Pipeline{
		{{Key: "$group", Value: bson.D{{Key: "_id", Value: "$batch"}, {"count", bson.D{{Key: "$sum", Value: 1}}}}}},
	}
	coursesPerBatchCursor, err := courseCollection.Aggregate(context.TODO(), coursesPerBatchPipeline)
	if err != nil {
		fmt.Println(err)
		return err
	}
	coursesPerBatch := []fiber.Map{}
	for coursesPerBatchCursor.Next(context.TODO()) {
		var document map[string]interface{}
		if err = coursesPerBatchCursor.Decode(&document); err != nil {
			continue
		}
		document["batch"] = document["_id"]
		delete(document, "_id")
		coursesPerBatch = append(coursesPerBatch, document)
	}

	response := fiber.Map{
		"message": "success",
		"data": fiber.Map{
			"totalCourses":            totalCourses,
			"chaptersPerCourse":       chaptersPerCourse,
			"totalDrafts":             totalDrafts,
			"totalProfessors":         totalProfessors,
			"totalStudents":           totalStudents,
			"totalPublishedCourses":   totalPublishedCourses,
			"totalUnpublishedCourses": totalUnpublishedCourses,
			"totalDeletedCourses":     totalDeletedCourses,
			"professorsPerDepartment": professorsPerDepartment,
			"studentsPerDepartment":   studentsPerDepartment,
			"studentsPerBatch":        studentsPerBatch,
			"coursesPerDepartment":    coursesPerDepartment,
			"coursesPerBatch":         coursesPerBatch,
		},
	}
	return c.Status(fiber.StatusOK).JSON(response)
}

func (svc *Service) ContentPermission(c *fiber.Ctx) error {
	role := c.Context().UserValue("role")
	if role != svc.Config.ADMIN_ROLE {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Access denied",
		})
	}
	var permission Permission
	if err := c.BodyParser(&permission); err != nil {
		return err
	}
	collection := svc.MongoDB.Database(svc.Config.MONGO_DATABASE).Collection(svc.Config.PERMISSION_COLLECTION)
	filter := bson.M{"userId": permission.UserId}
	count, _ := collection.CountDocuments(context.TODO(), filter)
	if count > 0 {
		permission.UpdatedAt = time.Now()
		update := bson.M{"$set": permission}
		_, err := collection.UpdateOne(context.TODO(), filter, update)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Permission not granted",
			})
		}
	} else {
		permission.CreatedAt = time.Now()
		_, err := collection.InsertOne(context.TODO(), permission)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Permission not granted",
			})
		}
	}
	svc.auditLog(permission,c.Context().UserValue("userId").(string),"permission")
	c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Permission granted successfully",
	})
	return nil
}

func (svc *Service) GetPermission(c *fiber.Ctx, userId string) map[string]interface{} {
	permissionMap := map[string]interface{}{
		"course": map[string]interface{}{
			"read":  false,
			"write": false,
		},
		"user": map[string]interface{}{
			"read":  false,
			"write": false,
		},
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

func (svc *Service) SentEmail(emails []string, messageData string, subject string, contentType string) {
	smtpHost := svc.Config.SMTP_SERVER
	smtpPort := svc.Config.SMTP_PORT
	smtpUsername := svc.Config.SMTP_BASEEMAIL
	smtpPassword := svc.Config.SMTP_PASSKEY
	message := []byte(fmt.Sprintf("Subject: %s\r\n"+
		"Content-Type: %s; charset=UTF-8\r\n"+
		"\r\n"+
		"%s", subject, contentType, messageData))
	auth := smtp.PlainAuth("", smtpUsername, smtpPassword, smtpHost)
	err := smtp.SendMail(fmt.Sprintf("%s:%s", smtpHost, smtpPort), auth, svc.Config.SMTP_BASEEMAIL, emails, message)
	log.Println(err, "cannot send the emails")
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
		"data":data,
		"action":action,
		"userId":userId,
	}
	collection.InsertOne(context.TODO(), auditData)
	return
}