#!/bin/bash
# BiteDash Production Build Script
# Builds frontend + backend for AWS deployment

set -e

echo "========================================="
echo "BiteDash Production Build"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "pom.xml" ]; then
    echo "ERROR: Run this script from bitedash-modular-backend directory"
    exit 1
fi

# Step 1: Build Frontend
echo "[1/3] Building React Frontend..."
cd ../frontend

# Use relative paths for production (served from same backend)
export VITE_API_BASE_URL=""

echo "  Installing dependencies..."
npm install --silent

echo "  Building production bundle..."
npm run build

if [ ! -d "dist" ]; then
    echo "ERROR: Frontend build failed"
    exit 1
fi

echo "  ✓ Frontend built successfully"
echo ""

# Step 2: Copy to backend static resources
echo "[2/3] Copying frontend to backend..."
cd ../bitedash-modular-backend

STATIC_DIR="app-module/src/main/resources/static"
rm -rf "$STATIC_DIR"
mkdir -p "$STATIC_DIR"
cp -r ../frontend/dist/* "$STATIC_DIR/"

echo "  ✓ Copied to $STATIC_DIR"
echo ""

# Step 3: Build Backend JAR
echo "[3/3] Building Spring Boot JAR..."

mvn clean package -DskipTests -pl app-module -am

if [ ! -f "app-module/target/bitedash-app.jar" ]; then
    echo "ERROR: Backend build failed"
    exit 1
fi

echo "  ✓ Backend built successfully"
echo ""

# Show results
echo "========================================="
echo "Build Complete!"
echo "========================================="
echo ""
echo "Deployment artifact:"
echo "  JAR: app-module/target/bitedash-app.jar"
echo "  Size: $(du -h app-module/target/bitedash-app.jar | cut -f1)"
echo ""
echo "Frontend assets included in JAR at /static"
echo ""
echo "Ready for AWS deployment!"
echo "Run: ./deploy-to-aws.sh"
