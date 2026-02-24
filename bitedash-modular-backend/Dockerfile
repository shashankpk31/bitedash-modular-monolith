# Multi-stage build for smaller image size
FROM maven:3.9-eclipse-temurin-17-alpine AS build

# Set working directory
WORKDIR /app

# Copy parent POM and module POMs
COPY pom.xml .
COPY shared-module/pom.xml shared-module/
COPY identity-module/pom.xml identity-module/
COPY organisation-module/pom.xml organisation-module/
COPY order-module/pom.xml order-module/
COPY menu-module/pom.xml menu-module/
COPY wallet-module/pom.xml wallet-module/
COPY payment-module/pom.xml payment-module/
COPY inventory-module/pom.xml inventory-module/
COPY notification-module/pom.xml notification-module/
COPY app-module/pom.xml app-module/

# Download dependencies (cached layer)
RUN mvn dependency:go-offline -B

# Copy source code
COPY shared-module/src shared-module/src
COPY identity-module/src identity-module/src
COPY organisation-module/src organisation-module/src
COPY order-module/src order-module/src
COPY menu-module/src menu-module/src
COPY wallet-module/src wallet-module/src
COPY payment-module/src payment-module/src
COPY inventory-module/src inventory-module/src
COPY notification-module/src notification-module/src
COPY app-module/src app-module/src

# Copy frontend build to static resources (if exists)
# This allows the JAR to serve the React frontend
COPY app-module/src/main/resources/static app-module/src/main/resources/static

# Build the application
RUN mvn clean package -DskipTests -pl app-module -am

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/app-module/target/bitedash-app.jar app.jar

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Expose port (AWS will set PORT env variable, defaults to 8089)
EXPOSE 8089

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8089/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-Xmx512m", "-Xms256m", "-jar", "app.jar"]
