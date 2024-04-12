FROM golang:alpine AS builder

# Set necessary environmet variables needed for our image
ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

# Move to working directory /build
WORKDIR /build  

# Copy and download dependency using go mod
COPY go.mod .
COPY go.sum .
RUN go mod download

# RUN go mod edit -replace ondc-gateway/common=../common
# RUN go mod edit -replace ondc-gateway/common=<path_to_module>

# Copy the code into the container
COPY . .

# Build the application
RUN go build -o main .

# Move to /dist directory as the place for resulting binary folder
WORKDIR /dist

# Copy binary from build to main folder
RUN cp /build/main .
RUN cp /build/.env .

# Build a small image
FROM alpine
# COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

WORKDIR /app

COPY --from=builder /dist/main /app/
COPY --from=builder /dist/.env /app/


EXPOSE 4001

# Command to run
ENTRYPOINT ["/app/main"]
