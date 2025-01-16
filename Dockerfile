FROM node:18

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 8080
EXPOSE 8000

# Command to run the server
CMD ["node", "src/server.js"]