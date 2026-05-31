# Stage 1: Build Frontend inside Render
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Bundle into Spring Boot
FROM maven:3.9-eclipse-temurin-17 AS backend-builder
WORKDIR /app
COPY bitedash-modular-backend/pom.xml .
COPY bitedash-modular-backend/shared-module/ ./shared-module/
COPY bitedash-modular-backend/identity-module/ ./identity-module/
COPY bitedash-modular-backend/organisation-module/ ./organisation-module/
COPY bitedash-modular-backend/menu-module/ ./menu-module/
COPY bitedash-modular-backend/inventory-module/ ./inventory-module/
COPY bitedash-modular-backend/order-module/ ./order-module/
COPY bitedash-modular-backend/wallet-module/ ./wallet-module/
COPY bitedash-modular-backend/payment-module/ ./payment-module/
COPY bitedash-modular-backend/notification-module/ ./notification-module/
COPY bitedash-modular-backend/app-module/ ./app-module/

# Copy React build straight to the static resources directory
COPY --from=frontend-builder /app/dist ./app-module/src/main/resources/static/

# Run the build tool out of the virtual app directory
RUN mvn -f pom.xml clean package -DskipTests

# Stage 3: Light Final Runtime Container
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-builder /app/app-module/target/*.jar app.jar
EXPOSE 8089
ENTRYPOINT ["java", "-jar", "app.jar"]