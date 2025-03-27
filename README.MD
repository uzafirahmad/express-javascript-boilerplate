# 📌 Project Setup Guide  

## 📂 Environment Variables (`.env` Files)  
Upload the following files inside the **root directory**:  
- `.env.production`  
- `.env.development`  

Each file should contain the following fields:  
```plaintext
JWT_SECRET=your_jwt_secret
NODE_ENV=production_or_development
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
DATABASE_URL=your_database_url
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/auth/google/callback
FRONTEND_URL=http://localhost:3000
```
Set `NODE_ENV` to either `production` or `development` as needed.  

---

## ⚙️ Configuration  
Ensure **Redis** is running before starting the server:  
```sh
redis-server
```

---

## 🚀 Start Server Commands  
- **Development Mode:**  
  ```sh
  npm run dev
  ```
- **Production Mode:**  
  ```sh
  npm run prod
  ```

---

## 🐳 Docker Deployment  
To build and start the application using Docker, run:  
```sh
docker-compose up --build
```

---