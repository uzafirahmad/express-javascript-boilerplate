## ENV's
Upload these 2 files inside the root directory

.env.production
.env.development

Create JWT_SECRET, NODE_ENV and DATABASE_URL fields in the ENV

## Config
Run redis, using redis-server

## Start server commands
npm run dev
npm run prod

## Dockerize
docker-compose up --build