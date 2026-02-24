# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Pass the API URL (Vite requires the VITE_ prefix)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the app (produces the /dist folder)
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine
# Copy built files from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html
# Copy Nginx config to handle React Router paths
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]