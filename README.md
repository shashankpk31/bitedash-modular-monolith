# 🍽️ BiteDash - Corporate Cafeteria Management System

![Java](https://img.shields.io/badge/Java-17-orange) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-green) ![React](https://img.shields.io/badge/React-19-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

> Modern food ordering platform for corporate cafeterias with wallet management, multi-vendor support, and real-time order tracking.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Test Credentials](#-test-credentials)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [License](#-license)

---

## ✨ Features

### 🔐 Multi-Role Authentication
- **Super Admin**: Platform management and monitoring
- **Org Admin**: Organization, location, and vendor management
- **Vendor**: Menu management and order processing
- **Employee**: Browse menus, place orders, manage wallet

### 💰 Wallet System
- Credit/debit wallet with transaction history
- Razorpay integration for top-ups
- Balance tracking and analytics
- Secure payment processing

### 📦 Order Management
- Real-time order tracking with WebSocket
- QR code generation for order pickup
- Order history and status updates
- Multi-vendor order support

### 🏪 Multi-Vendor Support
- Vendor registration and approval workflow
- Individual vendor menus with categories
- Cafeteria-to-vendor mapping
- Vendor analytics dashboard

### 📊 Analytics & Reporting
- Platform revenue tracking
- Vendor performance metrics
- Employee spending analytics
- Daily/weekly/monthly reports

### 🎨 Modern UI/UX
- Responsive design (mobile-first)
- Material Design 3 (Stitch Palette)
- Dark/light theme support
- Smooth animations with Framer Motion

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.3.12
- **Language**: Java 17
- **Database**: H2 (in-memory for production), PostgreSQL (local dev)
- **Cache**: Redis (optional, for OTP)
- **Authentication**: JWT with HTTP-only cookies
- **Architecture**: Modular Monolith (9 modules)

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: TailwindCSS 4
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router 7
- **Animations**: Framer Motion 12

### DevOps & Deployment
- **Container**: Docker (multi-stage builds)
- **Hosting**: Render (free tier)
- **CI/CD**: GitHub Actions (optional)
- **Monitoring**: Spring Boot Actuator

---

## 🏗️ Architecture

### Modular Monolith Structure

```
bitedash-modular-backend/
├── shared-module        # Common utilities, security, DTOs
├── identity-module      # Authentication, users, roles
├── organisation-module  # Organizations, locations, offices, cafeterias
├── menu-module          # Menus, categories, items, promotions
├── inventory-module     # Stock management, purchase orders
├── order-module         # Orders, QR codes, order tracking
├── wallet-module        # User wallets, transactions
├── payment-module       # Razorpay integration, payments
├── notification-module  # Email/SMS notifications
└── app-module           # Main application, configuration
```

**Why Modular Monolith?**
- ✅ Simpler deployment than microservices
- ✅ Faster development and testing
- ✅ Easy to extract modules to services later
- ✅ Shared transactions across modules

---

## 🚀 Quick Start

### Prerequisites

- **Java 17+** ([Download](https://adoptium.net/))
- **Node.js 20+** ([Download](https://nodejs.org/))
- **Maven 3.9+** (included in wrapper)
- **Git** ([Download](https://git-scm.com/))

### Local Development

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/bitedash.git
cd bitedash
```

#### 2. Start Backend

```bash
cd bitedash-modular-backend

# Copy environment template (optional for local H2)
cp .env.example .env

# Run with Maven
./mvnw spring-boot:run

# OR build and run JAR
./mvnw clean package -DskipTests
java -jar app-module/target/bitedash-app.jar
```

Backend runs on: **http://localhost:8089**

#### 3. Start Frontend (Separate Terminal)

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

Frontend runs on: **http://localhost:5173**

#### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8089
- **H2 Console**: http://localhost:8089/h2-console
  - **JDBC URL**: `jdbc:h2:mem:bitedash`
  - **Username**: `sa`
  - **Password**: *(leave empty)*
- **API Docs**: http://localhost:8089/swagger-ui.html

---

## 🔑 Test Credentials

The application auto-populates with sample data on startup (prod profile).

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Super Admin** | admin@bitedash.com | Admin@123 | Full platform access |
| **Org Admin** | orgadmin@techcorp.com | OrgAdmin@123 | TechCorp management |
| **Vendor** | vendor@pizzacorner.com | Vendor@123 | Pizza Corner menu |
| **Employee** | john.doe@techcorp.com | Employee@123 | ₹500 wallet balance |
| **Employee** | jane.smith@techcorp.com | Employee@123 | ₹300 wallet balance |

**Sample Data Includes:**
- 1 Organization: **TechCorp Inc.**
- 1 Location: **Bangalore, Karnataka**
- 1 Office: **Tech Park HQ**
- 1 Cafeteria: **Tech Park Food Court**
- 2 Vendors: **Pizza Corner**, **South Indian Kitchen**
- 15+ Menu Items across multiple categories
- 3 Employees with active wallets

---

## 📚 API Documentation

### Swagger UI (Development)

**URL**: http://localhost:8089/swagger-ui.html
**Status**: Disabled in production (security)

### Postman Collection

Import the Postman collection from `docs/BiteDash.postman_collection.json` (if available)

### Key Endpoints

| Category | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| **Auth** | POST | `/auth/register` | Register new user |
| **Auth** | POST | `/auth/login` | Login (returns JWT in cookie) |
| **Auth** | POST | `/auth/logout` | Logout (clears cookies) |
| **User** | GET | `/user/{id}` | Get user profile |
| **Organization** | GET | `/organization/public` | List all organizations |
| **Menu** | GET | `/menus/vendor/{id}` | Get vendor menu |
| **Order** | POST | `/orders` | Place new order |
| **Order** | GET | `/orders/my-orders` | Get user's orders |
| **Wallet** | GET | `/wallet/my-wallet` | Get wallet balance |
| **Wallet** | POST | `/wallet/credit` | Credit wallet (admin) |
| **Payment** | POST | `/payment/create-order` | Create Razorpay order |
| **Payment** | POST | `/payment/verify` | Verify payment |
| **Health** | GET | `/actuator/health` | Health check |
| **Keep-Alive** | GET | `/api/keep-alive` | Prevent Render sleep |

---

## 🌐 Deployment

### Deploy to Render (Free Tier)

#### Prerequisites
1. GitHub account with this repo pushed
2. Render account ([Sign up free](https://render.com))

#### Steps

1. **Connect GitHub to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render auto-detects `render.yaml`

2. **Deploy**
   - Render builds and deploys automatically
   - Uses Docker multi-stage build (frontend → backend → runtime)
   - H2 database auto-initialized with sample data
   - First deploy takes ~5 minutes

3. **Access Your App**
   - **URL**: `https://bitedash.onrender.com` (or your custom domain)
   - **Admin Panel**: `https://bitedash.onrender.com/admin`
   - **H2 Console**: `https://bitedash.onrender.com/h2-console`

#### Important Notes

- **Free Tier Limitations**:
  - Spins down after 15 minutes of inactivity
  - Cold start takes 30-60 seconds
  - 512 MB RAM
  - **Solution**: Use [UptimeRobot](https://uptimerobot.com/) to ping `/api/keep-alive` every 14 minutes

- **Database**: H2 in-memory (data resets on restart)
  - ✅ Perfect for demos and recruiter testing
  - ✅ Always fresh data
  - ❌ Not suitable for production with persistent data
  - **For production**: Switch to PostgreSQL in `application-prod.yml`

---

## 📁 Project Structure

```
bitedash/
├── bitedash-modular-backend/    # Spring Boot backend
│   ├── shared-module/
│   ├── identity-module/
│   ├── organisation-module/
│   ├── menu-module/
│   ├── inventory-module/
│   ├── order-module/
│   ├── wallet-module/
│   ├── payment-module/
│   ├── notification-module/
│   ├── app-module/
│   │   └── src/main/resources/
│   │       ├── static/          # Frontend build output (bundled)
│   │       ├── db/              # Database migration scripts
│   │       └── application-*.yml
│   ├── Dockerfile               # Multi-stage build
│   └── pom.xml
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── common/             # Shared components
│   │   ├── features/           # Feature modules
│   │   │   ├── admin/
│   │   │   ├── employee/
│   │   │   ├── vendor/
│   │   │   └── auth/
│   │   ├── services/           # API services
│   │   ├── contexts/           # React contexts
│   │   └── config/             # Configuration
│   ├── package.json
│   └── vite.config.js
├── render.yaml                  # Render deployment config
├── README.md                    # This file
└── LICENSE
```

---

## 🔧 Environment Variables

### Backend (application-prod.yml)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SPRING_PROFILES_ACTIVE` | Active profile | `prod` | ✅ |
| `JWT_SECRET` | JWT signing key | Auto-generated | ✅ |
| `PORT` | Server port | `8089` | ✅ |
| `REDIS_HOST` | Redis host (optional) | `localhost` | ❌ |
| `TWILIO_ACCOUNT_SID` | Twilio account (optional) | - | ❌ |
| `MAIL_HOST` | SMTP host (optional) | - | ❌ |

### Frontend (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8089` | ✅ (dev) |
| | | `""` (empty for prod) | ✅ (prod) |

**Note**: In production (bundled), frontend uses relative URLs (empty string)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Spring Boot** - Backend framework
- **React** - Frontend library
- **Render** - Free hosting platform
- **Razorpay** - Payment gateway
- **TailwindCSS** - Styling framework
- **Material Design 3** - Design system

---

## 📞 Support

For questions or issues:
- **Open an Issue**: [GitHub Issues](https://github.com/yourusername/bitedash/issues)
- **Email**: your.email@example.com

---

**Built with ❤️ for corporate cafeterias everywhere**
