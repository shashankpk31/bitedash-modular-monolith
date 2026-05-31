# Running BiteDash in Eclipse/STS

## Quick Start Guide

### 1. Import Project

1. Open Eclipse/STS
2. File -> Import -> Maven -> Existing Maven Projects
3. Browse to `D:\BiteDash\bitedash-modular-backend`
4. Select all modules (check all pom.xml files)
5. Click Finish

### 2. Run the Application

**Option A: Right-click run**
1. Navigate to `app-module/src/main/java/com/bitedash/BiteDashApplication.java`
2. Right-click -> Run As -> Java Application

**Option B: Boot Dashboard (STS only)**
1. Open Boot Dashboard (Window -> Show View -> Boot Dashboard)
2. Click on `bitedash-app`
3. Press the green run button

### 3. Required Environment Variables

Before running, set these in your run configuration (Run -> Run Configurations -> Environment tab):

```
DATABASE_URL=jdbc:postgresql://localhost:5432/bitedash
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=yourpassword
JWT_SECRET=your-256-bit-secret-key-here-make-it-long
```

Or create a file `app-module/src/main/resources/application-local.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/bitedash
    username: postgres
    password: yourpassword

jwt:
  secret: your-256-bit-secret-key-here-make-it-long
```

Then set active profile to `local` in run configuration.

### 4. Verify Application Started

- Health endpoint: http://localhost:8089/actuator/health
- Swagger UI: http://localhost:8089/swagger-ui.html

---

## Running Tests

### Run ALL Tests

**In IDE:**
1. Right-click on `bitedash-modular-backend` project
2. Run As -> Maven test

**Command Line:**
```bash
cd bitedash-modular-backend
mvn clean test
```

### Run Tests for a Single Module

Right-click on any module (e.g., `identity-module`) -> Run As -> Maven test

Or in terminal:
```bash
mvn test -pl identity-module
```

### Run a Single Test Class

1. Open the test file (e.g., `OrderServiceTest.java`)
2. Right-click -> Run As -> JUnit Test

---

## Important Notes

### `mvn spring-boot:run` vs `mvn test`

| Command | What it does |
|---------|--------------|
| `mvn spring-boot:run` | Starts the application (does NOT run tests) |
| `mvn test` | Runs all unit tests (does NOT start the app) |
| `mvn verify` | Runs unit + integration tests |
| `mvn clean install` | Compiles, runs tests, packages JAR |

### Test Framework Stack

- **JUnit 5** - Test runner
- **Mockito** - Mocking framework
- **AssertJ** - Fluent assertions
- **Spring Boot Test** - Integration testing
- **H2** - In-memory database for tests

---

## Troubleshooting

### "Bean not found" errors
1. Make sure you're running the main class in `app-module`
2. Verify all modules are properly imported

### Database connection errors
1. Check PostgreSQL is running
2. Verify environment variables are set
3. Create the database if it doesn't exist: `CREATE DATABASE bitedash;`

### Test failures
```bash
# Run with debug output
mvn test -X

# Run specific test class
mvn test -Dtest=OrderServiceTest
```
