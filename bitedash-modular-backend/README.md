# BiteDash Modular Monolith

A modular monolithic architecture for the BiteDash food ordering platform. This application consolidates all microservices into a single deployable JAR file while maintaining strong module boundaries.

## Architecture

```
modular_bitedash/
├── shared-module/           # Common utilities, DTOs, security
├── identity-module/         # Authentication & User Management
├── organisation-module/     # Organization, Location, Office, Cafeteria
├── order-module/           # Order Management
├── menu-module/            # Menu & MenuItem Management
├── wallet-module/          # Wallet & Transactions
├── payment-module/         # Payment Processing
├── notification-module/    # Email/SMS Notifications
└── app-module/            # Main Spring Boot Application (deployable JAR)
```

## Key Features

- **Single Deployment**: One JAR file for the entire application
- **Modular Design**: Strong boundaries between business domains
- **Shared Database**: Single PostgreSQL instance with schema separation
- **JWT Authentication**: Stateless authentication with role-based access
- **AWS Ready**: Optimized for AWS EC2, Elastic Beanstalk, and ECS deployment
- **Health Checks**: Built-in health endpoints for monitoring
- **API Documentation**: Swagger UI at `/swagger-ui.html`

## Prerequisites

- **Java 17** or higher
- **Maven 3.9+**
- **PostgreSQL 15+**
- **Docker** (optional, for containerized deployment)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd modular_bitedash
```

### 2. Set Up Database

Create a PostgreSQL database:

```bash
createdb bitedash_monolith
```

Or using psql:

```sql
CREATE DATABASE bitedash_monolith;
```

Create schemas (the application will auto-create tables):

```sql
\c bitedash_monolith

CREATE SCHEMA IF NOT EXISTS identity_schema;
CREATE SCHEMA IF NOT EXISTS organisation_schema;
CREATE SCHEMA IF NOT EXISTS order_schema;
CREATE SCHEMA IF NOT EXISTS menu_schema;
CREATE SCHEMA IF NOT EXISTS wallet_schema;
CREATE SCHEMA IF NOT EXISTS payment_schema;
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

Copy `.env.example` to `.env` and set values (or create `.env` with):

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/bitedash_monolith
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=myVerySecretKeyForJwtTokenGenerationThatIsAtLeast256BitsLong
PORT=8089
```

### 4. Build the Application

```bash
# Build all modules
mvn clean install

# Or build only the app module with dependencies
mvn clean package -pl app-module -am
```

### 5. Run the Application

**Important:** Run from the **backend root** (`bitedash-modular-backend`) so the `.env` file is found:

```bash
# From bitedash-modular-backend directory:
mvn spring-boot:run -pl app-module

# Or using the JAR
java -jar app-module/target/bitedash-app.jar
```

**If running from IDE or without .env:** use the dev profile (uses built-in dev defaults for DB and JWT):

```bash
# Bash / CMD
mvn spring-boot:run -pl app-module -Dspring-boot.run.profiles=dev

# PowerShell (quote the -D argument)
mvn spring-boot:run -pl app-module "-Dspring-boot.run.profiles=dev"
```

Or in your IDE run configuration, add VM option: `-Dspring.profiles.active=dev`

Dev profile defaults: `localhost:5432`, user `postgres`, password `postgres`. Override via `.env` or env vars if your DB differs.

The application will start on `http://localhost:8089`

### 6. Access Swagger UI

Open your browser and navigate to:
- **Swagger UI**: http://localhost:8089/swagger-ui.html
- **API Docs**: http://localhost:8089/v3/api-docs
- **Health Check**: http://localhost:8089/actuator/health

## Deployment

### AWS Deployment (Recommended)

BiteDash is optimized for deployment on AWS with multiple deployment options:

#### Quick Start (Automated)

Use the automated deployment script for fastest setup:

```bash
# Navigate to project directory
cd bitedash-modular-backend

# Run automated deployment script
bash deploy-to-aws.sh
```

This script will:
- Create all required AWS resources (VPC, security groups, RDS, Redis, EC2)
- Initialize database schema
- Build and deploy the application
- Configure and start the service

**Estimated time**: 15-20 minutes

#### Deployment Options

1. **AWS EC2** - Full control, best for getting started
   - Monthly cost: ~$50 (development) to $160 (production)
   - Complete infrastructure control
   - See: [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md#option-a-simple-ec2-deployment)

2. **AWS Elastic Beanstalk** - Managed platform with auto-scaling
   - Monthly cost: ~$80 (development) to $300 (production)
   - Automatic scaling and load balancing
   - See: [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md#option-b-production-elastic-beanstalk-deployment)

3. **AWS ECS/Fargate** - Container-based serverless deployment
   - Monthly cost: ~$100 (development) to $400+ (production)
   - Serverless container orchestration
   - See: [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md#option-c-container-based-ecs-deployment)

#### Documentation

- **Complete Guide**: [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md) - Comprehensive AWS deployment instructions
- **Quick Start**: [AWS_QUICK_START.md](AWS_QUICK_START.md) - TL;DR version with common commands
- **Deployment Checklist**: [AWS_DEPLOYMENT_CHECKLIST.md](AWS_DEPLOYMENT_CHECKLIST.md) - Track your deployment progress

#### Prerequisites

- AWS account with billing enabled
- AWS CLI installed and configured (`aws configure`)
- PostgreSQL client (`psql` command)
- Maven for building the application
- OpenSSL for generating secrets

### Docker Deployment

1. **Build Docker Image**:
   ```bash
   docker build -t bitedash-app .
   ```

2. **Run Container**:
   ```bash
   docker run -d \
     -p 8089:8089 \
     -e DATABASE_URL=jdbc:postgresql://host.docker.internal:5432/bitedash_monolith \
     -e DATABASE_USERNAME=postgres \
     -e DATABASE_PASSWORD=postgres \
     -e JWT_SECRET=myVerySecretKeyForJwtTokenGenerationThatIsAtLeast256BitsLong \
     --name bitedash \
     bitedash-app
   ```

3. **Check Logs**:
   ```bash
   docker logs -f bitedash
   ```

### Docker Compose (with PostgreSQL)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: bitedash_monolith
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "8089:8089"
    environment:
      DATABASE_URL: jdbc:postgresql://postgres:5432/bitedash_monolith
      DATABASE_USERNAME: postgres
      DATABASE_PASSWORD: postgres
      JWT_SECRET: myVerySecretKeyForJwtTokenGenerationThatIsAtLeast256BitsLong
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5432/bitedash_monolith` | Yes |
| `DATABASE_USERNAME` | Database username | `postgres` | Yes |
| `DATABASE_PASSWORD` | Database password | `postgres` | Yes |
| `JWT_SECRET` | JWT signing secret (min 256 bits) | (see application.yml) | Yes |
| `PORT` | Application port | `8089` | No |

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Health & Monitoring
- `GET /actuator/health` - Health check endpoint
- `GET /actuator/info` - Application info
- `GET /actuator/metrics` - Application metrics

### Documentation
- `GET /swagger-ui.html` - Swagger UI
- `GET /v3/api-docs` - OpenAPI specification

## Module Communication

Modules communicate through:

1. **Public APIs**: Service interfaces exposed by each module
2. **Spring Events**: Domain events for loose coupling
3. **Direct Method Calls**: In-process calls (no network overhead)

Example:
```java
// Order module uses Menu module's public API
@Service
public class OrderService {
    @Autowired
    private MenuService menuService; // From menu-module

    public void createOrder() {
        MenuItem item = menuService.getMenuItem(itemId);
        // ... order logic
    }
}
```

## Database Schema

The application uses a single PostgreSQL database with schema separation:

```
bitedash_monolith/
├── identity_schema
│   └── users
├── organisation_schema
│   ├── organizations
│   ├── locations
│   ├── offices
│   └── cafeterias
├── order_schema
│   ├── orders
│   └── order_items
├── menu_schema
│   ├── menu_items
│   └── categories
├── wallet_schema
│   └── user_wallets
└── payment_schema
    └── transactions
```

## Development Guidelines

### Adding a New Module

1. Create module directory: `new-module/`
2. Create `pom.xml` with parent reference
3. Add module to parent POM's `<modules>` section
4. Create package structure: `com.bitedash.newmodule`
5. Add module dependency to `app-module/pom.xml`
6. Update `@SpringBootApplication` scanBasePackages

### Module Boundaries

- **DO**: Depend on `shared-module` for common utilities
- **DO**: Expose public APIs through service interfaces
- **DON'T**: Access another module's entities directly
- **DON'T**: Access another module's repositories

### Testing

```bash
# Run all tests
mvn test

# Run tests for specific module
mvn test -pl identity-module

# Skip tests during build
mvn package -DskipTests
```

## Monitoring

### Health Check

```bash
curl http://localhost:8089/actuator/health
```

Response:
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    }
  }
}
```

### Logs

The application logs to stdout. Configure log levels in `application.yml`:

```yaml
logging:
  level:
    com.bitedash: DEBUG
    org.springframework: INFO
```

## Performance Tuning

### JVM Options

For production deployments:

```bash
java -Xmx512m -Xms256m \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -jar app-module/target/bitedash-app.jar
```

### Database Connection Pool

Adjust in `application.yml`:

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
```

## Troubleshooting

### Application won't start

1. **Missing DATABASE_URL / JWT_SECRET:** The app requires these unless you use the dev profile.
   - **Option A:** Create a `.env` file in **bitedash-modular-backend** (copy from `.env.example`) and run from that directory so `.env` is loaded.
   - **Option B:** Run with dev profile: `mvn spring-boot:run -pl app-module -Dspring-boot.run.profiles=dev` (uses dev defaults; do not use in production).

2. **Running from IDE:** If your run configuration uses a different working directory, `.env` may not be found. Either set the IDE run to use `bitedash-modular-backend` as working directory, or add VM option: `-Dspring.profiles.active=dev`.

3. **Check database connection**:
   ```bash
   psql -h localhost -U postgres -d bitedash_monolith
   ```

4. **Check environment variables** (PowerShell):
   ```powershell
   $env:DATABASE_URL
   ```

5. **Check logs**:
   ```bash
   java -jar app-module/target/bitedash-app.jar
   ```

### 401 Unauthorized errors

- Ensure JWT token is included in `Authorization: Bearer <token>` header
- Check token hasn't expired (24 hours default)
- Verify JWT_SECRET matches between deployments

### Database schema issues

```sql
-- Drop and recreate schemas
DROP SCHEMA IF EXISTS identity_schema CASCADE;
CREATE SCHEMA identity_schema;
-- Repeat for other schemas
```

## Migration from Microservices

If migrating from the microservices version:

1. **Data Migration**: Export data from individual databases and import into monolith
2. **API Compatibility**: Endpoints remain the same
3. **Configuration**: Consolidate configs from multiple services
4. **Remove**: Eureka, Config Server, API Gateway dependencies

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and commit: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature-name`
5. Create Pull Request

## License

[Add your license here]

## Support

For issues and questions:
- GitHub Issues: [repository-url]/issues
- Email: support@bitedash.com
