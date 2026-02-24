# BiteDash Frontend - React Application

> Modern, responsive frontend for the BiteDash food ordering platform built with React 19, Vite, and Tailwind CSS.

---

## 🎨 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | Component-based UI framework |
| **Vite** | 7.2.4 | Fast development server & build tool |
| **React Router** | 7.11.0 | Client-side routing |
| **Axios** | 1.13.2 | HTTP client with interceptors |
| **TanStack Query** | 5.90.16 | Server state management |
| **Tailwind CSS** | 3.4.19 | Utility-first CSS framework |
| **Framer Motion** | 12.24.12 | Smooth animations |
| **Lucide React** | 0.562.0 | Modern icon library |
| **React Hot Toast** | 2.6.0 | Toast notifications |
| **html5-qrcode** | 2.3.8 | QR code scanning |
| **qrcode.react** | 4.0.1 | QR code generation |
| **vite-plugin-pwa** | 1.2.0 | Progressive Web App support |

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── axiosInstance.js         # Axios configuration with JWT interceptor
│   │
│   ├── components/
│   │   ├── ui/                      # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── QRCodeDisplay.jsx    # QR code display with download
│   │   │   ├── QRScanner.jsx        # QR code scanner (html5-qrcode)
│   │   │   ├── RatingModal.jsx      # 1-5 star rating modal
│   │   │   └── RevenueChart.jsx     # Admin revenue donut chart
│   │   │
│   │   └── order/                   # Order-specific components
│   │       ├── OrderCard.jsx        # Order display with QR & rating
│   │       └── OrderForm.jsx        # Enhanced order placement form
│   │
│   ├── config/
│   │   └── constants.js             # API paths, roles, constants
│   │
│   ├── context/
│   │   └── AuthContext.jsx          # Authentication state management
│   │
│   ├── features/                    # Feature-based modules
│   │   ├── admin/                   # Super Admin (ROLE_SUPER_ADMIN)
│   │   │   ├── pages/
│   │   │   │   └── SuperAdminOverview.jsx   # Platform stats & revenue chart
│   │   │   └── services/
│   │   │       └── adminService.js
│   │   │
│   │   ├── org-admin/               # Organization Admin (ROLE_ORG_ADMIN)
│   │   │   ├── pages/
│   │   │   │   ├── OrgDashboard.jsx
│   │   │   │   ├── LocationManager.jsx
│   │   │   │   └── LocationDetails.jsx
│   │   │   └── services/
│   │   │       └── orgAdminService.js
│   │   │
│   │   ├── vendor/                  # Vendor (ROLE_VENDOR)
│   │   │   ├── pages/
│   │   │   │   ├── VendorDashboard.jsx
│   │   │   │   └── QRScanner/
│   │   │   │       └── index.jsx    # QR scanner page
│   │   │   └── services/
│   │   │       └── vendorService.js
│   │   │
│   │   ├── employee/                # Employee (ROLE_EMPLOYEE)
│   │   │   ├── pages/
│   │   │   │   ├── MenuBrowse.jsx
│   │   │   │   ├── OrderHistory.jsx
│   │   │   │   └── Wallet.jsx
│   │   │   └── services/
│   │   │       └── employeeService.js
│   │   │
│   │   └── auth/                    # Authentication
│   │       ├── components/
│   │       │   └── LoginForm.jsx
│   │       └── services/
│   │           └── authService.js
│   │
│   ├── layouts/
│   │   ├── DashboardLayout.jsx      # Common dashboard layout
│   │   └── PublicLayout.jsx         # Public pages layout
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx            # Protected routes configuration
│   │
│   ├── App.jsx                      # Root component
│   └── main.jsx                     # Entry point
│
├── public/                          # Static assets
│   ├── icons/                       # PWA icons
│   ├── vite.svg
│   └── manifest.json
│
├── Dockerfile                       # Multi-stage Docker build
├── nginx.conf                       # Nginx configuration for SPA
├── vite.config.js                   # Vite build configuration
├── tailwind.config.js               # Tailwind theme configuration
├── package.json
└── README.md                        # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ LTS
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install
```

### Development Server

```bash
# Start Vite dev server with hot module replacement
npm run dev
# or
pnpm dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Build optimized production bundle
npm run build
# or
pnpm build

# Preview production build locally
npm run preview
# or
pnpm preview
```

### Linting

```bash
# Run ESLint
npm run lint
# or
pnpm lint
```

---

## 🔑 Key Features

### 1. QR Code System

**QRCodeDisplay Component** (`components/ui/QRCodeDisplay.jsx`)
- Displays order QR codes using `qrcode.react`
- Download QR code as PNG functionality
- Shows order number and instructions
- Used in OrderCard for customer order pickup

```jsx
import QRCodeDisplay from '../components/ui/QRCodeDisplay';

<QRCodeDisplay
  qrCodeData={order.qrCodeData}
  orderNumber={order.orderNumber}
  size={180}
/>
```

**QRScanner Component** (`components/ui/QRScanner.jsx`)
- Vendor QR code scanning using `html5-qrcode`
- Camera access with fps: 10, qrbox: 250x250
- Success/error states with visual feedback
- Instructions for proper scanning

```jsx
import QRScanner from '../components/ui/QRScanner';

<QRScanner
  onScan={(decodedText) => handleQRScan(decodedText)}
/>
```

**QRScannerPage** (`features/vendor/pages/QRScanner/index.jsx`)
- Full vendor page for scanning customer QR codes
- Displays order details after successful scan
- Status update buttons (CONFIRMED → PREPARING → READY → COMPLETED)
- Customer information and special instructions display

### 2. Order Management

**OrderForm Component** (`components/order/OrderForm.jsx`)
- **Order Type Selection**: DINE_IN 🍽️, TAKEAWAY 🥡, DELIVERY 🚚
- **Scheduled Time**: Optional datetime picker (minimum 30 minutes in advance)
- **Special Instructions**: 500-character textarea for order customization
- **Order Summary**: Item list with quantities and total amount
- Validation and error handling

```jsx
<OrderForm
  cartItems={cartItems}
  totalAmount={totalAmount}
  onSubmit={handleOrderSubmit}
  submitting={submitting}
/>
```

**OrderCard Component** (`components/order/OrderCard.jsx`)
- Status badges with icons and colors
- Collapsible QR code section for easy access
- Rating button for completed orders
- Special instructions display
- Order timeline with timestamps

### 3. Rating System

**RatingModal Component** (`components/ui/RatingModal.jsx`)
- Interactive 1-5 star selection
- Hover effects for preview
- Rating labels: Poor, Fair, Good, Very Good, Excellent
- Optional feedback textarea (500 characters)
- Form validation (requires star rating)

```jsx
<RatingModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  order={order}
  onSubmitRating={handleRateOrder}
/>
```

### 4. Admin Revenue Dashboard

**RevenueChart Component** (`components/ui/RevenueChart.jsx`)
- SVG donut chart visualization
- Three revenue categories:
  - Order Commission (15%) - Orange
  - Gateway Markup (2%) - Blue
  - Promotion Revenue - Purple
- Color-coded legend with amounts and percentages
- Dynamic revenue insights
- Responsive 2-column layout (chart + breakdown)

```jsx
<RevenueChart
  revenueStats={revenueStats}
  loading={loading}
/>
```

---

## 🔐 Authentication

### JWT Token Management

The application uses JWT tokens stored in localStorage:

```javascript
// Token storage
localStorage.setItem('hb_token', token);
localStorage.setItem('hb_user', JSON.stringify(user));

// Token retrieval
const token = localStorage.getItem('hb_token');
const user = JSON.parse(localStorage.getItem('hb_user'));
```

### Axios Interceptor

All API requests automatically include the JWT token:

```javascript
// src/api/axiosInstance.js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### AuthContext

The `AuthContext` provides:
- User authentication state
- Login/logout methods
- Role-based access control
- Token refresh logic

```jsx
import { useAuth } from '../context/AuthContext';

const { user, login, logout } = useAuth();
```

---

## 🛣️ Routing

### Protected Routes

Routes are protected based on user roles:

```jsx
<ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
  <SuperAdminOverview />
</ProtectedRoute>

<ProtectedRoute allowedRoles={['ROLE_ORG_ADMIN']}>
  <OrgDashboard />
</ProtectedRoute>

<ProtectedRoute allowedRoles={['ROLE_VENDOR']}>
  <VendorDashboard />
</ProtectedRoute>

<ProtectedRoute allowedRoles={['ROLE_EMPLOYEE']}>
  <MenuBrowse />
</ProtectedRoute>
```

### Route Configuration

Main routes defined in `src/routes/AppRoutes.jsx`:

- `/` - Public landing page
- `/login` - Authentication
- `/admin/*` - Super admin dashboard
- `/org-admin/*` - Organization admin dashboard
- `/vendor/*` - Vendor dashboard
- `/employee/*` - Employee dashboard

---

## 🎨 Styling

### Tailwind CSS Configuration

Custom brand colors defined in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      'brand-primary': '#f97316',    // Orange
      'brand-secondary': '#ea580c',
      'brand-tertiary': '#fdba74',
    }
  }
}
```

### Common Utility Classes

```html
<!-- Buttons -->
<button className="px-6 py-3 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95">

<!-- Cards -->
<div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">

<!-- Input Fields -->
<input className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-transparent">
```

---

## 📦 State Management

### TanStack Query (React Query)

Used for server state management:

```jsx
// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['orders'],
  queryFn: () => orderService.getMyOrders(),
  refetchOnWindowFocus: false,
});

// Mutations
const mutation = useMutation({
  mutationFn: (orderData) => orderService.createOrder(orderData),
  onSuccess: () => {
    queryClient.invalidateQueries(['orders']);
    toast.success('Order placed successfully!');
  },
});
```

### Query Keys Convention

```javascript
// User-specific
['user', userId]
['user-wallet', userId]

// Organization-specific
['organization', orgId]
['locations', orgId]
['offices', locationId]

// General
['orders']
['menu', vendorId]
['promotions']
```

---

## 🔔 Notifications

Using `react-hot-toast` for user feedback:

```jsx
import toast from 'react-hot-toast';

// Success
toast.success('Order placed successfully!');

// Error
toast.error('Failed to place order');

// Loading
const toastId = toast.loading('Placing order...');
toast.success('Order placed!', { id: toastId });

// Custom duration
toast.success('Message', { duration: 5000 });
```

---

## 🎭 Animations

Using `framer-motion` for smooth transitions:

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>
```

---

## 📱 Progressive Web App (PWA)

### Features

- Offline capability
- Install to home screen
- App-like experience on mobile
- Service worker for caching

### Configuration

PWA settings in `vite.config.js`:

```javascript
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'BiteDash',
    short_name: 'BiteDash',
    theme_color: '#f97316',
    icons: [/* ... */]
  }
})
```

---

## 🐳 Docker Deployment

### Multi-Stage Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

SPA routing configuration in `nginx.conf`:

```nginx
location / {
  root /usr/share/nginx/html;
  try_files $uri $uri/ /index.html;
}
```

---

## 🧪 Testing

### Vitest Configuration

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Example Test

```jsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

---

## 🌍 Environment Variables

Create a `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:8089
VITE_APP_NAME=BiteDash
VITE_APP_VERSION=1.0.0
```

Access in code:

```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## 📊 Component Library

### Button Component

```jsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
```

### Modal Component

```jsx
<Modal isOpen={isOpen} onClose={onClose} title="Modal Title">
  <p>Modal content</p>
</Modal>
```

---

## 🚀 Performance Optimization

### Code Splitting

```jsx
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./features/admin/pages/Dashboard'));

<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

### Image Optimization

```jsx
// Use appropriate image formats
<img src="/logo.webp" alt="Logo" loading="lazy" />
```

### Memoization

```jsx
import { useMemo, useCallback } from 'react';

const expensiveValue = useMemo(() => computeExpensiveValue(data), [data]);
const handleClick = useCallback(() => doSomething(), []);
```

---

## 📈 Build Analysis

```bash
# Analyze bundle size
npm run build -- --mode analyze

# Check for unused dependencies
npx depcheck

# Lighthouse audit
npm run build && npm run preview
# Then run Lighthouse in Chrome DevTools
```

---

## 🔧 Common Issues & Solutions

### Issue: CORS Errors

**Solution**: Ensure API Gateway CORS is configured correctly.

### Issue: Token Expiration

**Solution**: Implement token refresh logic in Axios interceptor.

### Issue: QR Scanner Not Working

**Solution**: Check camera permissions and HTTPS requirement for production.

### Issue: PWA Not Installing

**Solution**: Verify manifest.json and ensure HTTPS in production.

---

## 📝 Code Style Guide

### Component Structure

```jsx
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Component
function MyComponent({ prop1, prop2 }) {
  // 3. State
  const [state, setState] = useState(null);

  // 4. Queries/Mutations
  const { data } = useQuery({ ... });

  // 5. Effects
  useEffect(() => { ... }, []);

  // 6. Handlers
  const handleClick = () => { ... };

  // 7. Render
  return ( ... );
}

// 8. Export
export default MyComponent;
```

### Naming Conventions

- Components: PascalCase (`MyComponent.jsx`)
- Services: camelCase (`orderService.js`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Functions: camelCase (`handleSubmit`)

---

## 🤝 Contributing

1. Follow the existing code style
2. Write meaningful commit messages
3. Update documentation for new features
4. Test thoroughly before committing

---

## 📄 License

This project is for educational purposes and portfolio demonstration.

---

**Frontend Complete! ✅**
**React 19 + Vite + Tailwind CSS + TanStack Query**
