# Stage 1: Build Frontend inside Render
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY ../frontend/package*.json ./
RUN npm ci
COPY ../frontend/ ./
RUN npm run build

# Stage 2: Bundle into Spring Boot
FROM maven:3.9-eclipse-temurin-17 AS backend-builder
WORKDIR /app
COPY pom.xml .
COPY shared-module/ ./shared-module/
COPY identity-module/ ./identity-module/
COPY organisation-module/ ./organisation-module/
COPY menu-module/ ./menu-module/
COPY inventory-module/ ./inventory-module/
COPY order-module/ ./order-module/
COPY wallet-module/ ./wallet-module/
COPY payment-module/ ./payment-module/
COPY notification-module/ ./notification-module/
COPY app-module/ ./app-module/

# This line pulls the freshly built frontend from Stage 1 directly into your resources
COPY --from=frontend-builder /app/dist ./app-module/src/main/resources/static/

RUN mvn clean package -DskipTests

# Stage 3: Light Final Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-builder /app/app-module/target/*.jar app.jar
EXPOSE 8089
ENTRYPOINT ["java", "-jar", "app.jar"]