# Pull the official base image
FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --legacy-peer-deps

# Add app
COPY . ./

ENV PORT 4000
# Start the application on port 4000
CMD ["npm", "start"]
