package main

import (
	"content/common"
	"time"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/mongo"
)

type Service struct {
	Router *fiber.App
	Config common.ServiceConfiguration
	MongoDB *mongo.Client
}


type Course struct {
    Name            string    `json:"name" bson:"name" validate:"required"`
    ChaptersCount int `json:"chaptersCount" bson:"chaptersCount"`
    CourseCode string   `json:"courseCode" bson:"courseCode" validate:"required"`
    ContentType string  `json:"contentType" bson:"contentType" validate:"required"`
    Description     string    `json:"description" bson:"description"`
    Department        string    `json:"department" bson:"department" validate:"required"`
    Batch              string   `json:"batch" bson:"batch" validate:"required"`
    Semester        string    `json:"semester" bson:"semester" validate:"required"`
    ProfessorId      []string    `json:"professorId" bson:"professorId"`
    Level           string    `json:"level" bson:"level"`
    Duration        int       `json:"duration" bson:"duration"`
    Prerequisites   string    `json:"prerequisites" bson:"prerequisites"`
    Tags            []string  `json:"tags" bson:"tags"`
    CoverImage      string    `json:"coverImage" bson:"coverImage"`
    Language        string    `json:"language" bson:"language"`
    Certification   bool      `json:"certification" bson:"certification"`
    StartDate       time.Time `json:"startDate" bson:"startDate"`
    EndDate         time.Time `json:"endDate" bson:"endDate"`
    Version         string     `json:"version" bson:"version"`
    CreatedBy        string    `json:"createdBy" bson:"createdBy"`
    CreatedAt       time.Time `json:"createdAt" bson:"createdAt"`
    UpdatedAt       time.Time `json:"updatedAt" bson:"updatedAt"`
    Status          string      `json:"status" bson:"status"`
}

type Chapter struct {
    Name               string    `json:"name" bson:"name" validate:"required"`
    CourseId           string    `json:"courseId" bson:"courseId" validate:"required"`
    LessonsCount int `json:"lessonsCount" bson:"lessonsCount"`
    ContentType string  `json:"contentType" bson:"contentType" validate:"required"`
    Description         string    `json:"description" bson:"description"`
    Duration           int       `json:"duration" bson:"duration"`
    Order              int       `json:"order" bson:"order" validate:"required"`
    Attachments        []Attachments  `json:"attachments" bson:"attachments"`
    Quiz               Quiz      `json:"quiz" bson:"quiz"`
    Prerequisites      string    `json:"prerequisites" bson:"prerequisites"`
    ExternalLinks      []string  `json:"externalLinks" bson:"externalLinks"`
    CreatedBy        string    `json:"createdBy" bson:"createdBy"`
    CreatedAt          time.Time `json:"createdAt" bson:"createdAt"`
    UpdatedAt       time.Time `json:"updatedAt" bson:"updatedAt"`
    Status          string      `json:"status" bson:"status"`
}

type Lesson struct {
    Name               string    `json:"name" bson:"name" validate:"required"`
    ChapterId           string    `json:"chapterId" bson:"chapterId" validate:"required"`
    ContentType string  `json:"contentType" bson:"contentType" validate:"required"`
    Description         string    `json:"description" bson:"description" validate:"required"`
    Content         string    `json:"content" bson:"content"`
    Order              int       `json:"order" bson:"order" validate:"required"`
    Attachments        []Attachments  `json:"attachments" bson:"attachments"`
    Quiz               Quiz      `json:"quiz" bson:"quiz"`
    ExternalLinks      []string  `json:"externalLinks" bson:"externalLinks"`
    CreatedBy        string    `json:"createdBy" bson:"createdBy"`
    CreatedAt          time.Time `json:"createdAt" bson:"createdAt"`
    UpdatedAt       time.Time `json:"updatedAt" bson:"updatedAt"`
    Status          string      `json:"status" bson:"status"`
}

type Attachments struct {
    Name string  `json:"name" bson:"name"`
    Type string  `json:"type" bson:"type"`
    Url  string  `json:"url" bson:"url"`
}

type Quiz struct {
    Questions      []Question `json:"questions" bson:"questions"`
    CompletionTime int        `json:"completionTime" bson:"completionTime"`
}

type Question struct {
    Text          string   `json:"text" bson:"text" validate:"required"`
    Options       []string `json:"options" bson:"options" validate:"required,min=2,dive,required"`
    CorrectAnswer string   `json:"correctAnswer" bson:"correctAnswer" validate:"required"`
}


type Permission struct {
    UserId string `json:"userId" bson:"userId"`
    Modules ModulePermission `json:"modules" bson:"modules"`
    CreatedAt  time.Time `json:"createdAt" bson:"createdAt"`
    UpdatedAt   time.Time `json:"updatedAt" bson:"updatedAt"`
}

type ModulePermission struct {
    Course PermissionSet `json:"course" bson:"course"`
    User PermissionSet `json:"user" bson:"user"`
}


type PermissionSet struct {
    Read bool  `json:"read" bson:"read"`
    Write  bool  `json:"write" bson:"write"`
}

type Sort struct {
    Field string `json:"field"`
    Value int  `json:"value"`
}