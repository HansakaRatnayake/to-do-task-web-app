FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Set Vite environment variable at build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build frontend
RUN npm run build

# Install serve to serve build
RUN npm install -g serve

# Expose frontend port
EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
