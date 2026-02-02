# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --silent || npm install --silent

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
