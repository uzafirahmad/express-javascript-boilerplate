# Use a lightweight Node.js image
FROM node:alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy your application code
COPY . .

# Expose port 8080 for the Node.js server
EXPOSE 8080

# Add Redis server as a service
RUN apk add --no-cache redis

# Expose the default Redis port (6379)
EXPOSE 6379


# CMD ["redis-server"]  
# ENTRYPOINT ["node", "server.js"]

CMD ["sh", "-c", "redis-server & sleep 1 && node server.js"]

