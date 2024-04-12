package main

import (
	"log"

	"github.com/go-playground/validator"
)

var validate = validator.New()

// init initializes the service handler
func (svc *Service) init() {
	// Initialize the tracer
	if err := svc.initTracer(); err != nil {
		log.Fatalln("Error initializing tracer:", err)
	}
	// Initialize the router
	svc.Router = svc.initRouter()
	svc.MongoDB = svc.initMongo()
	// Define the routes for the application
	appRoute := svc.Router.Group(svc.Config.SERVICE_BASEPATH)
	{
		//validate token middleware
		appRoute.Get("/catalogue",svc.Catalogue)
		appRoute.Get("/masterdata", svc.GetMasterData)
		appRoute.Post("/masterdata", svc.CreateMasterData)
		appRoute.Use(ValidateToken(svc))
		appRoute.Post("/content/:collection", svc.CreateContent)
		appRoute.Post("/course", svc.GetAllContents)
		appRoute.Get("/course/draft", svc.GetAllContentDrafts)
		appRoute.Post("/chapter", svc.GetAllChapters)
		appRoute.Get("/chapter/draft", svc.GetAllChapterDrafts)
		appRoute.Post("/lesson", svc.GetAllLessons)
		appRoute.Get("/lesson/draft", svc.GetAllLessonsDrafts)
		appRoute.Get("/content/approvals", svc.GetAllContentApprovals)
		appRoute.Get("/content/notifications",svc.GetContentNotifications)
		appRoute.Put("/content/approve", svc.ApproveContent)
		appRoute.Get("/content/:collection/:id", svc.GetContent)
		// appRoute.Get("/search",svc.Search)
		appRoute.Put("/content/:collection/:id", svc.UpdateContent)
		appRoute.Delete("/content/:collection/:id", svc.DeleteContent)
		appRoute.Post("/permission", svc.ContentPermission)
		appRoute.Post("/upload",svc.UploadImage)
		appRoute.Post("/bucket",svc.CreateBucket)
		appRoute.Delete("/bucket",svc.DeleteBucket)
		appRoute.Get("/dashboard", svc.Dashboard)
	}
}

// main is the entry point for the service/server.
// It initializes the content service, loads the configuration, and starts the server.
func main() {
	contentSrvc := &Service{}
	var err error
	// Load the configuration
	contentSrvc.Config, err = loadConfig()
	if err != nil {
		log.Fatalln(err.Error(), err)
	}
	// Initialize the content service
	contentSrvc.init()

	// Start the server
	contentSrvc.Router.Listen(":" + contentSrvc.Config.SERVICE_PORT)
}
