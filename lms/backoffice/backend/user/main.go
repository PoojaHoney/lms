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
		appRoute.Post("/defaultuser", svc.CreateDefaultUser)
		appRoute.Post("/login", svc.Login)
		appRoute.Get("/catalogue",svc.Catalogue)
		//validate token middleware
		appRoute.Use(ValidateToken(svc))
		appRoute.Post("/user", svc.CreateUser)
		appRoute.Post("/multiuser", svc.CreateUsers)
		appRoute.Get("/user/:id", svc.GetUser)
		appRoute.Get("/user/profile/:id", svc.GetUserProfile)
		appRoute.Put("/user/:id", svc.UpdateUser)
		appRoute.Delete("/user/:id", svc.DeleteUser)
		appRoute.Post("/users", svc.GetAllUsers)
		appRoute.Get("/role", svc.GetRoles)
		appRoute.Post("/role", svc.PostRole)
		appRoute.Post("/bulkuser",svc.BulkInsertUsers)
	}
}

// main is the entry point for the service/server.
// It initializes the user service, loads the configuration, and starts the server.
func main() {
	userSrvc := &Service{}
	var err error
	// Load the configuration
	userSrvc.Config, err = loadConfig()
	if err != nil {
		log.Fatalln(err.Error(), err)
	}
	// Initialize the user service
	userSrvc.init()

	// Start the server
	userSrvc.Router.Listen(":" + userSrvc.Config.SERVICE_PORT)
}
