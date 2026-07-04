# MediFlow Frontend

React 19 + Vite single-page application for the MediFlow Hospital Management SaaS platform.

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework |
| Vite 5 | Build tool & dev server |
| React Router 7 | Client-side routing |
| Recharts | Dashboard charts |
| Lucide React | Icon system |
| React Hot Toast | Notifications |
| Axios | HTTP client |
| Vanilla CSS + Google Fonts | Styling (Outfit, Inter) |

---

## Folder Structure

```
frontend/src/
├── components/
│   ├── charts/
│   │   └── DashboardCharts.jsx   # RevenueArea, PatientGrowth, AppointmentTrend, StatusPie
│   └── ui/
│       └── StatCard.jsx          # Reusable KPI stat card
├── context/
│   └── AuthContext.jsx           # Global auth state (user, login, logout)
├── layouts/
│   └── DashboardLayout.jsx       # Sidebar + header shell
├── pages/
│   ├── auth/                     # Login, Register, ForgotPassword
│   ├── dashboard/                # AdminDashboard, DoctorDashboard, ReceptionistDashboard
│   ├── patients/                 # PatientList, PatientDetails
│   ├── appointments/             # AppointmentList, BookAppointment
│   ├── pharmacy/                 # MedicineList, MedicineForm
│   ├── laboratory/               # LabTestList, LabTestDetail
│   ├── billing/                  # InvoiceList, InvoiceDetail, PaymentHistory
│   ├── reports/                  # RevenueReport, PatientReport, AppointmentReport
│   └── DashboardHome.jsx         # Role-based dashboard router (lazy)
├── routes/
│   ├── AppRoutes.jsx             # Route definitions
│   └── ProtectedRoute.jsx        # Role-guarded wrapper
└── services/
    ├── api.js                    # Axios instance (baseURL, auth header, interceptors)
    └── dashboardAPI.js           # Dashboard & report API calls
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend URL (empty = use Vite proxy on localhost) |

```bash
# .env (development — leave VITE_API_URL empty to use proxy)
VITE_API_URL=

# .env.production (Vercel — set actual backend URL)
VITE_API_URL=https://mediflow-api.onrender.com
```

---

## Running Locally

```bash
# Install (react-is peer dep required for recharts)
npm install --legacy-peer-deps

# Development server (port 5173 with /api proxy to port 5000)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## Role-Permission Matrix

| Page / Feature | SUPER_ADMIN | HOSPITAL_ADMIN | DOCTOR | RECEPTIONIST | PHARMACIST | LAB_TECH | PATIENT |
|----------------|:-----------:|:--------------:|:------:|:------------:|:----------:|:--------:|:-------:|
| Admin Dashboard | ✅ | ✅ | — | — | — | — | — |
| Doctor Dashboard | — | — | ✅ | — | — | — | — |
| Receptionist Dashboard | — | — | — | ✅ | — | — | — |
| Revenue Report | ✅ | ✅ | — | — | — | — | — |
| Patient Report | ✅ | ✅ | — | — | — | — | — |
| Appointment Report | ✅ | ✅ | — | — | — | — | — |
| Patient List | ✅ | ✅ | ✅ | ✅ | — | — | — |
| Register Patient | ✅ | ✅ | — | ✅ | — | — | — |
| Appointments | ✅ | ✅ | ✅ | ✅ | — | — | ✅ (own) |
| Medical Records | ✅ | ✅ | ✅ | — | — | — | ✅ (own) |
| Pharmacy Inventory | ✅ | ✅ | ✅ (read) | — | ✅ | — | — |
| Dispense Medicine | ✅ | ✅ | — | — | ✅ | — | — |
| Lab Tests | ✅ | ✅ | ✅ | — | — | ✅ | ✅ (own) |
| Billing / Invoices | ✅ | ✅ | — | ✅ | — | — | ✅ (own) |
| Payments | ✅ | ✅ | — | ✅ | — | — | ✅ (own) |

---

## Build Output

```
dist/
├── index.html                          # ~1 KB
├── assets/index.css                    # ~54 KB (gzip: 9 KB)
├── assets/AdminDashboard-*.js         # ~11 KB (lazy)
├── assets/DoctorDashboard-*.js        # ~8 KB (lazy)
├── assets/ReceptionistDashboard-*.js  # ~11 KB (lazy)
├── assets/DashboardCharts-*.js        # ~430 KB (Recharts)
└── assets/index-*.js                  # ~560 KB (main bundle)
```

> Dashboard components are code-split via `React.lazy` for faster initial loads.

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (from frontend/ directory)
vercel --prod

# Or connect GitHub repo in vercel.com dashboard
# Build command: npm run build
# Output directory: dist
# Install command: npm install --legacy-peer-deps
```

Set environment variable in Vercel dashboard:
```
VITE_API_URL = https://mediflow-api.onrender.com
```
