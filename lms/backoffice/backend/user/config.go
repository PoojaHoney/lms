package main

import (
	"context"
	"fmt"
	"log"

	// swagger "github.com/arsmn/fiber-swagger/v2"
	"user/common"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/monitor"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/spf13/viper"
	_ "github.com/spf13/viper/remote"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/jaeger"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
	trace "go.opentelemetry.io/otel/trace"
)

// loadConfig loads the service configuration from a YAML file and environment variables.
// It returns the loaded configuration or an error if the loading process fails.
func loadConfig() (config common.ServiceConfiguration, err error) {

	// Set the configuration type to YAML
	// viper.SetConfigType("yaml")
	// // Set the configuration path to /etc/config
	// viper.AddConfigPath("/etc/config")
	// // Set the configuration name to lms-qa-user-config
	// viper.SetConfigName("lms-qa-user-config")

	/* In local  */
	viper.AddConfigPath("./")
	viper.SetConfigName(".env")
	viper.SetConfigType("env")

	// Load environment variables
	viper.AutomaticEnv()
	// Read the configuration file
	errOccured := viper.ReadInConfig()
	if errOccured != nil {
		return config, errOccured
	}
	// Unmarshal the configuration into the config struct
	errOccured = viper.Unmarshal(&config)
	if errOccured != nil {
		return config, errOccured
	}
	return
}

// initRouter initializes and configures the router for the service.
func (srv *Service) initRouter() *fiber.App {
	// Create a new Fiber app instance
	app := fiber.New(fiber.Config{
		ProxyHeader:             fiber.HeaderXForwardedFor,
		AppName:                 srv.Config.SERVICE_NAME,
		BodyLimit:               1 * 1024 * 1024 * 1024,
		EnableTrustedProxyCheck: true,
	})
	// Use the logger middleware
	app.Use(logger.New())
	// Use the recover middleware
	app.Use(recover.New())
	// Use the CORS middleware for handling cross-origin requests
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowMethods:     "POST, GET, PUT, DELETE",
		AllowHeaders:     "Access-Control-Allow-Origin, Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization",
		AllowCredentials: false,
		ExposeHeaders:    "Content-Length",
		MaxAge:           86400,
	}))
	// Use the compress middleware for response compression
	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed,
	}))
	// Define a route for the health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(http.StatusOK).JSON(&fiber.Map{"status": "Ok"})
	})
	// Define a route for the metrics endpoint
	app.Get("/metrics", monitor.New(monitor.Config{Title: "Config service Metrics Page"}))

	// docs.SwaggerInfo.Title = "Swagger for ONDC Request Processor APIs"
	// docs.SwaggerInfo.Description = "ONDC Gateway Request Processor API's"
	// docs.SwaggerInfo.Version = "2.0"
	// docs.SwaggerInfo.Host = srv.Config.SERVICE_HOST
	// docs.SwaggerInfo.BasePath = ""
	// docs.SwaggerInfo.Schemes = []string{"https", "http"}
	// app.Get(fmt.Sprintf("%s/swagger/*", srv.Config.SERVICE_BASEPATH), swagger.HandlerDefault)
	return app
}


func (srv *Service) initMongo() *mongo.Client {
	client, err := mongo.NewClient(options.Client().ApplyURI(fmt.Sprintf("mongodb://%s:%s@%s:%s/",
		srv.Config.MONGO_USERNAME,
		srv.Config.MONGO_PASSWORD,
		srv.Config.MONGO_HOST, srv.Config.MONGO_PORT,
		//srv.Config.MONGO_DATABASE,
		) + "?maxPoolSize=10&retryWrites=true&w=majority&authSource=admin"))
	// client, err := mongo.NewClient(options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Println("Unable to create database client.", err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	err = client.Connect(ctx)
	if err != nil {
		log.Println("Unable to create database client.", err)
	}
	fmt.Println("DB Connected")
	return client
}

// initTracer initializes the Jaeger tracer and sets it as the global tracer provider.
func (srv *Service) initTracer() error {
	// Create a new tracer provider using the Jaeger URL from the service config.
	tp, err := srv.newTracerProvider(srv.Config.JAEGER_URL)
	if err != nil {
		return err
	}
	// Set the newly created tracer provider as the global tracer provider.
	otel.SetTracerProvider(tp)
	// Set the service name as the tracer name.
	tp.Tracer(srv.Config.SERVICE_NAME)
	return nil
}

var span trace.Span

// newAppTracer is a middleware function that injects traces into the request/response flow.
// It creates a new span for the request and sets various attributes related to the request.
// The function returns an error if there was an error in the request handling.
func (srv *Service) newAppTracer() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Start a new span for the request
		_, span = otel.Tracer(srv.Config.SERVICE_NAME).Start(context.TODO(), c.Path())
		defer span.End()
		start := time.Now()
		// handle request
		err := c.Next()
		// Set attributes related to the request
		span.SetAttributes(
			attribute.String("collection", c.Params("collection")),
			attribute.String("route", c.Context().URI().String()),
			attribute.String("name", srv.Config.SERVICE_NAME),
			attribute.String("IP", c.IP()),
			attribute.Int("Status Code", c.Response().StatusCode()),
			attribute.String("latency", time.Since(start).String()),
			attribute.String("user-agent", c.Get(fiber.HeaderUserAgent)),
		)
		if err != nil {
			fmt.Println("Error occurred at Tracer Creation: ", err.Error())
		}
		return nil
	}
}

// newTracerProvider creates a new tracer provider for tracing requests.
// It takes a URL as input and returns a tracer provider and an error (if any).
func (srv *Service) newTracerProvider(url string) (*sdktrace.TracerProvider, error) {
	// Create the Jaeger exporter with the provided URL.
	exp, err := jaeger.New(jaeger.WithCollectorEndpoint(jaeger.WithEndpoint(url)))
	if err != nil {
		return nil, err
	}
	// Create a new tracer provider with the Jaeger exporter.
	tp := sdktrace.NewTracerProvider(
		// Always batch spans in production.
		sdktrace.WithBatcher(exp),
		// Record information about this application in a Resource.
		sdktrace.WithResource(resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceName(srv.Config.SERVICE_NAME),
			attribute.String("Service", srv.Config.SERVICE_NAME),
			attribute.String("Port", srv.Config.SERVICE_PORT),
			attribute.String("Description", srv.Config.SERVICE_DESCRIPTION),
			attribute.String("Version", srv.Config.SERVICE_VERSION),
		)),
	)
	return tp, nil
}
