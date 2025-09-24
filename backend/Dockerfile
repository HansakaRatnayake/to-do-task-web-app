FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Install PostgreSQL client (for pg_isready)
RUN apk add --no-cache postgresql-client bash

# Copy all source code
COPY . .

# Copy wait-for-it script
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Build TypeScript
RUN npm run build

# Expose backend port
EXPOSE 5000

# Wait for Postgres, run migrations, seed, and start the app
CMD [ "sh", "-c", "/wait-for-it.sh db:5432 -- npx prisma generate && npx prisma migrate deploy && npx ts-node prisma/seed.ts && node dist/index.js" ]
