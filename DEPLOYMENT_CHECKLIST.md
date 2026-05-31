# 🚀 BiteDash Deployment Checklist

Complete step-by-step guide for deploying BiteDash to Render (free tier).

---

## 📋 Pre-Deployment Checklist

### 1. ✅ Code Cleanup

- [ ] All Claude AI files ignored (`.claude/`, `.claude-plugin/`, `CLAUDE.md`)
- [ ] Only `README.md` remains in root directory
- [ ] No hardcoded secrets in code
- [ ] `.env.example` files created with placeholders
- [ ] Git history clean (no sensitive data)

### 2. ✅ Build Verification

```bash
# Test backend build
cd bitedash-modular-backend
mvn clean package -DskipTests

# Verify JAR created
ls -lh app-module/target/bitedash-app.jar
```

### 3. ✅ Docker Test (Optional but Recommended)

```bash
# Build Docker image locally
cd bitedash-modular-backend
docker build -t bitedash:local .

# Run locally
docker run -p 8089:8089 -e SPRING_PROFILES_ACTIVE=prod bitedash:local

# Test endpoints
curl http://localhost:8089/actuator/health
curl http://localhost:8089/api/keep-alive
```

---

## 🔧 GitHub Repository Setup

### Main Repository (bitedash)

1. **Create GitHub Repository**
   ```bash
   # Initialize if not already done
   cd D:/BiteDash
   git init
   git add .
   git commit -m "Initial commit: BiteDash v1.0"
   ```

2. **Add Remote**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/bitedash.git
   git branch -M main
   git push -u origin main
   ```

3. **Verify .gitignore**
   ```bash
   # Ensure Claude files are ignored
   cat .gitignore | grep -E "\.claude|CLAUDE\.md"
   ```

4. **Make Repository Private**
   - Go to GitHub Settings → Danger Zone
   - Change visibility to Private

### Separate Repository (razorpay-simulator)

1. **Create New Repository**
   ```bash
   cd D:/BiteDash/razorpay-simulator
   git init
   git add .
   git commit -m "Initial commit: Razorpay Simulator"
   ```

2. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/razorpay-simulator.git
   git branch -M main
   git push -u origin main
   ```

3. **Make Private** (optional)

---

## 🌐 Render Deployment

### Account Setup

1. **Create Render Account**
   - Go to https://render.com/
   - Sign up with GitHub (recommended)
   - Free tier: No credit card required

2. **Connect GitHub**
   - Dashboard → Account Settings
   - Connected Accounts → GitHub
   - Authorize Render

---

### Deploy Main Application (bitedash)

#### Step 1: Create Web Service

1. **Dashboard → New → Blueprint**
   - Select repository: `bitedash`
   - Render auto-detects `render.yaml`
   - Click "Apply"

2. **Wait for Build** (~5 minutes)
   - ✅ Frontend build (npm ci, npm run build)
   - ✅ Backend build (mvn clean package)
   - ✅ Docker image creation
   - ✅ Deployment

3. **Verify Deployment**
   - **URL**: `https://bitedash-XXXXX.onrender.com`
   - **Health Check**: `/actuator/health`
   - **Keep-Alive**: `/api/keep-alive`
   - **Frontend**: `/` (root)

#### Step 2: Configure Environment Variables

Render auto-configures from `render.yaml`, but verify:

| Variable | Value | Auto-Set? |
|----------|-------|-----------|
| `SPRING_PROFILES_ACTIVE` | `prod` | ✅ Yes |
| `JWT_SECRET` | `<generated>` | ✅ Yes |
| `PORT` | `8089` | ✅ Yes |
| `JAVA_OPTS` | `-Xmx256m -Xms128m` | ✅ Yes |
| `VITE_API_BASE_URL` | `""` (empty) | ✅ Yes |

**To verify/update:**
- Web Service → Environment
- Check all variables match `render.yaml`

#### Step 3: Test Application

```bash
# Health check
curl https://bitedash-XXXXX.onrender.com/actuator/health

# Keep-alive
curl https://bitedash-XXXXX.onrender.com/api/keep-alive

# Frontend
curl https://bitedash-XXXXX.onrender.com/ | head -20
```

**Browser Test:**
1. Open `https://bitedash-XXXXX.onrender.com`
2. Should see login page
3. Login with test credentials:
   - Email: `john.doe@techcorp.com`
   - Password: `Employee@123`
4. Verify wallet page loads
5. Try placing an order

---

### Deploy Razorpay Simulator (Optional)

#### Step 1: Create Web Service

1. **Dashboard → New → Blueprint**
   - Select repository: `razorpay-simulator`
   - Render auto-detects `render.yaml`
   - Click "Apply"

2. **Wait for Build** (~3 minutes)

3. **Access Admin Dashboard**
   - **URL**: `https://razorpay-simulator-XXXXX.onrender.com/admin`

#### Step 2: Update BiteDash Payment Config

If deploying simulator, update BiteDash environment:

1. **Go to bitedash Web Service**
2. **Environment** → Add new variable:
   - **Key**: `RAZORPAY_BASE_URL`
   - **Value**: `https://razorpay-simulator-XXXXX.onrender.com`
3. **Save** → Auto-redeploys

---

## ⏱️ Setup Keep-Alive Monitoring

### Why?

Render free tier spins down after 15 minutes of inactivity.
Cold start takes 30-60 seconds.
**Solution**: Ping `/api/keep-alive` every 14 minutes.

### Setup UptimeRobot (Free)

1. **Create Account**
   - Go to https://uptimerobot.com/
   - Sign up (free plan: 50 monitors)

2. **Add New Monitor**
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: BiteDash Keep-Alive
   - **URL**: `https://bitedash-XXXXX.onrender.com/api/keep-alive`
   - **Monitoring Interval**: **14 minutes** (important!)
   - Click "Create Monitor"

3. **Verify**
   - Monitor status should show "Up"
   - Check logs after 14 minutes

### Alternative: cron-job.org

1. Go to https://cron-job.org/
2. Create account
3. Add job:
   - **URL**: `https://bitedash-XXXXX.onrender.com/api/keep-alive`
   - **Schedule**: Every 14 minutes

---

## 🧪 Post-Deployment Testing

### Automated Tests

```bash
# Health check
curl https://bitedash-XXXXX.onrender.com/actuator/health
# Expected: {"status":"UP"}

# Keep-alive
curl https://bitedash-XXXXX.onrender.com/api/keep-alive
# Expected: {"status":"alive","timestamp":"..."}

# Public endpoint
curl https://bitedash-XXXXX.onrender.com/organization/public
# Expected: [{"id":1,"name":"TechCorp Inc.",...}]
```

### Manual Testing Checklist

- [ ] Homepage loads
- [ ] Login with test credentials works
- [ ] Employee dashboard displays wallet balance
- [ ] Menu page shows vendors and items
- [ ] Cart functionality works
- [ ] Wallet top-up (if simulator deployed)
- [ ] Order placement works
- [ ] QR code generation works
- [ ] Vendor dashboard accessible
- [ ] Org Admin dashboard accessible
- [ ] Super Admin dashboard accessible

---

## 📊 Monitoring & Logs

### View Logs

1. **Go to Render Dashboard**
2. **Web Service** → **Logs**
3. **Real-time logs** show:
   - Application startup
   - Database initialization
   - API requests
   - Errors

### Key Log Messages to Check

```
✅ DatabaseInitializer: Database initialization complete!
✅ Started BiteDashApplication in X seconds
✅ Super Admin created: admin@bitedash.com
✅ Organization created: TechCorp Inc.
```

### Health Dashboard

- **URL**: `https://bitedash-XXXXX.onrender.com/actuator/health`
- **Monitor**: Should always return `{"status":"UP"}`

---

## 🐛 Troubleshooting

### Build Fails

**Issue**: Docker build fails during frontend build
**Solution**:
```bash
# Check frontend build locally
cd frontend
npm ci
npm run build
# Verify dist/ directory created
```

**Issue**: Maven build fails
**Solution**:
```bash
# Check backend build locally
cd bitedash-modular-backend
mvn clean package -DskipTests
# Check for compilation errors
```

### Application Won't Start

**Issue**: H2 database errors
**Solution**: Check logs for schema issues. H2 should create schema automatically.

**Issue**: Port binding error
**Solution**: Verify `PORT` env var is set (Render sets it automatically)

### Frontend Not Loading

**Issue**: 404 on root path
**Solution**:
- Verify frontend was built and copied to `/static`
- Check `StaticResourceConfig.java` is present
- Check logs for static resource mapping

### API Calls Failing

**Issue**: CORS errors
**Solution**: In `SecurityConfig.java`, verify CORS allows Render domain

**Issue**: 401 Unauthorized
**Solution**: Check JWT cookie is being set in login response

### Database Empty

**Issue**: No sample data on startup
**Solution**:
- Verify `SPRING_PROFILES_ACTIVE=prod`
- Check `DatabaseInitializer.java` logs
- Verify `@Profile("prod")` annotation

---

## 🔄 Updating Deployment

### Push Updates

```bash
# Make changes
git add .
git commit -m "Update: description of changes"
git push origin main
```

**Render auto-deploys** on push to main branch.

### Manual Redeploy

1. Go to Render Dashboard
2. Web Service → **Manual Deploy**
3. Select branch (main)
4. Click "Deploy"

---

## 📈 Performance Tips

### Optimize Render Free Tier

1. **Keep-Alive**: Essential (set up above)
2. **Memory**: Already optimized (`-Xmx256m`)
3. **H2 Database**: In-memory (fastest)
4. **Static Resources**: Cached (configured)

### Expected Performance

- **Cold Start**: 30-60 seconds
- **Warm Response**: 200-500ms
- **Database Queries**: <100ms (in-memory)
- **Static Assets**: <50ms (cached)

---

## ✅ Deployment Complete!

Your application is now live at:
- **Main App**: `https://bitedash-XXXXX.onrender.com`
- **Admin Dashboard**: `https://bitedash-XXXXX.onrender.com/admin`
- **H2 Console**: `https://bitedash-XXXXX.onrender.com/h2-console`

**Test Credentials**:
- Employee: `john.doe@techcorp.com` / `Employee@123`
- Vendor: `vendor@pizzacorner.com` / `Vendor@123`
- Org Admin: `orgadmin@techcorp.com` / `OrgAdmin@123`
- Super Admin: `admin@bitedash.com` / `Admin@123`

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **GitHub Issues**: Create issue in your repository
- **Render Support**: Community forum at https://community.render.com/

---

**Congratulations! Your application is deployed! 🎉**
