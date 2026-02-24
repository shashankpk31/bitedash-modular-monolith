# 🍔 BiteDash - Food Ordering Platform

A comprehensive food ordering platform built as a **modular monolith** with Spring Boot and React.

## 📋 Project Overview

**BiteDash** is a full-stack food ordering application that consolidates a microservices architecture into a modular monolith for easier deployment and maintenance.

### Tech Stack

**Backend:**
- Java 17
- Spring Boot 3.x
- PostgreSQL
- Redis (for OTP/caching)
- Spring Security + JWT
- WebSockets (real-time updates)

**Frontend:**
- React 19.2.0
- Vite 7.2.4
- React Router
- Axios
- Tailwind CSS (if applicable)

**Deployment:**
- Railway (Platform-as-a-Service)
- Docker
- Single JAR deployment with embedded frontend

## 🏗️ Architecture

### Modular Monolith Structure

```
bitedash-modular-backend/
├── shared-module/           # Shared DTOs, utilities, security
├── identity-module/         # User authentication & authorization
├── organisation-module/     # Organizations, vendors, cafeterias
├── menu-module/            # Menu items, categories, promotions
├── inventory-module/       # Stock management
├── order-module/           # Order processing & tracking
├── payment-module/         # Revenue & commission tracking
├── wallet-module/          # User wallet management
├── notification-module/    # Email/SMS notifications
└── app-module/            # Main application & configuration
```

### Key Features

✅ Multi-tenant organization support
✅ Role-based access control (Super Admin, Org Admin, Vendor, Employee)
✅ Real-time order tracking via WebSockets
✅ Wallet-based payments
✅ QR code order pickup
✅ Commission tracking & revenue analytics
✅ Email & SMS notifications
✅ JWT-based authentication
✅ Cross-module event-driven communication

## 🚀 Quick Start

### Prerequisites

- **Java 17+**
- **Maven 3.8+**
- **Node.js 18+**
- **PostgreSQL 14+**
- **Redis** (optional, for OTP)

### Local Development

#### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/bitedash.git
cd bitedash
```

#### 2. Set Up Backend

```bash
# Navigate to backend
cd bitedash-modular-backend

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=jdbc:postgresql://localhost:5432/bitedash
# DATABASE_USERNAME=your_user
# DATABASE_PASSWORD=your_password
# JWT_SECRET=your_jwt_secret_here

# Run database initialization script
psql -U your_user -d bitedash -f app-module/src/main/resources/db/V1__init_all_tables.sql

# Build and run
mvn spring-boot:run -pl app-module
```

Backend will run on: `http://localhost:8089`

#### 3. Set Up Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:8089" > .env

# Run development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

## 🌐 Deploy to Railway

### One-Command Deployment

**Windows:**
```bash
build-for-deployment.bat
```

**Linux/Mac:**
```bash
chmod +x build-for-deployment.sh
./build-for-deployment.sh
```

This script:
1. Builds the React frontend
2. Copies frontend to backend `/static` folder
3. Creates a single JAR with embedded frontend

### Railway Setup

See **[QUICKSTART-DEPLOYMENT.md](./QUICKSTART-DEPLOYMENT.md)** for complete Railway deployment instructions.

**Quick steps:**
1. Push code to GitHub/GitLab
2. Create Railway project from repo
3. Add PostgreSQL database in Railway
4. Set environment variables (JWT_SECRET, etc.)
5. Railway auto-deploys using Dockerfile
6. Access at: `https://your-app.railway.app`

## 📚 Documentation

- **[QUICKSTART-DEPLOYMENT.md](./QUICKSTART-DEPLOYMENT.md)** - Quick Railway deployment guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment documentation
- **[CLAUDE.md](./CLAUDE.md)** - Development notes & architecture details

## 🔐 Security

### Fixed Security Issues

✅ Role-based authorization properly enforced
✅ Wallet initialization requires admin role
✅ Database credentials moved to environment variables
✅ JWT secret requires environment variable
✅ Password validation (8+ chars, uppercase, lowercase, digit, special)
✅ Order authorization checks (user owns order)
✅ Public cafeteria endpoints require authentication

### Production Security Checklist

- [ ] Use strong JWT secret (64+ characters)
- [ ] Use strong database password
- [ ] Enable HTTPS (Railway does this automatically)
- [ ] Set `ddl-auto: validate` in production
- [ ] Disable Swagger UI in production (already done in prod profile)
- [ ] Restrict actuator endpoints
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting for OTP endpoints (recommended)

## 🧪 API Documentation

### Swagger UI (Development Only)

Access API docs at: `http://localhost:8089/swagger-ui.html`

**Note:** Swagger is disabled in production (`application-prod.yml`)

### Key Endpoints

**Authentication:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `POST /auth/verify` - Verify OTP

**Organizations:**
- `GET /organization/public` - List all organizations (public)
- `GET /organization/{id}` - Get organization details

**Orders:**
- `POST /orders` - Create new order
- `GET /orders/my-orders` - Get current user's orders
- `GET /orders/{id}` - Get order details
- `PATCH /orders/{id}/status` - Update order status

**Wallet:**
- `GET /wallet/my-wallet` - Get current user's wallet
- `POST /wallet/credit` - Add credits (Admin only)
- `GET /wallet/transactions` - Get transaction history

**Menu:**
- `GET /menus/vendor/{vendorId}` - Get vendor menu
- `GET /menus/items/{id}` - Get menu item details

## 📊 Database Schema

The application uses PostgreSQL with 7 schemas:

- `identity_schema` - Users, roles, authentication
- `organisation_schema` - Organizations, vendors, cafeterias
- `order_schema` - Orders, order status history
- `menu_schema` - Menu items, categories, promotions
- `wallet_schema` - User wallets, transactions
- `payment_schema` - Revenue tracking, commissions
- `inventory_schema` - Stock management

Initialize with:
```bash
psql -U user -d database -f bitedash-modular-backend/app-module/src/main/resources/db/V1__init_all_tables.sql
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary. All rights reserved.

## 🆘 Support

For issues and questions:
1. Check **[QUICKSTART-DEPLOYMENT.md](./QUICKSTART-DEPLOYMENT.md)** for deployment help
2. Check **[DEPLOYMENT.md](./DEPLOYMENT.md)** for detailed troubleshooting
3. Open an issue on GitHub

## 📅 Changelog

### 2026-02-18 - Production Ready
- ✅ Completed all cross-module integrations
- ✅ Wallet module fully implemented
- ✅ Security fixes applied
- ✅ API routing aligned with frontend
- ✅ Railway deployment configured
- ✅ Static frontend serving enabled

### 2026-02-17 - Railway Setup
- ✅ Database initialization scripts
- ✅ Build automation scripts
- ✅ Production configuration
- ✅ Deployment documentation

### 2026-02-16 - Security Hardening
- ✅ Fixed authorization bypass vulnerabilities
- ✅ Removed hardcoded credentials
- ✅ Added password validation
- ✅ Enhanced endpoint security

---

**Built with ❤️ for efficient food ordering**

**Version:** 1.0.0
**Last Updated:** 2026-02-18
