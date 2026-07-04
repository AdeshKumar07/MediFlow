# 🏥 MediFlow — Hospital Management SaaS

<div align="center">

![MediFlow](https://img.shields.io/badge/MediFlow-v1.0.0-6366f1?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A production-ready, multi-role Hospital Management SaaS platform** built with the MERN stack.  
Covering Clinical, Administrative, Pharmacy, Laboratory, and Billing operations.

</div>

---

## ✨ Features

| Module | Description |
|--------|-------------|
| **Auth & RBAC** | JWT + HTTP-only cookie, 7 roles, refresh token rotation |
| **Patient Management** | Registration, profiles, medical history, EMR |
| **Appointments** | Booking, scheduling, availability, queue management |
| **Medical Records (EMR)** | Diagnoses, prescriptions, SOAP notes |
| **Pharmacy** | Medicine inventory, prescription dispensing, stock alerts |
| **Laboratory** | Lab test orders, result upload, PDF reports |
| **Billing & Payments** | Invoice creation, Razorpay integration, PDF invoices/receipts |
| **Dashboards** | Role-based analytics: Admin, Doctor, Receptionist |
| **Reports** | Revenue, Patient, Appointment reports with date filters |
| **API Docs** | Swagger UI at `/api/docs` |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router 7, Recharts, Lucide |
| Backend | Node.js 22, Express.js 5 |
| Database | MongoDB (Mongoose 8), MongoDB Atlas |
| Auth | JWT (access + refresh), bcryptjs, HTTP-only cookies |
| Payment | Razorpay |
| PDF | PDFKit |
| File Upload | Multer |
| API Docs | Swagger UI (OpenAPI 3.0) |
| Deployment | Render (backend) + Vercel (frontend) |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB running locally **or** a MongoDB Atlas connection string

### 1. Clone and Install

```bash
git clone https://github.com/your-org/mediflow.git
cd mediflow

# Backend
cd backend
cp .env.example .env   # Edit values
npm install
npm run dev            # Starts on port 5000

# Frontend (new terminal)
cd frontend
cp .env.example .env   # Edit VITE_API_URL if needed
npm install --legacy-peer-deps
npm run dev            # Starts on port 5173
```

### 2. Access the App

| URL | Purpose |
|-----|---------|
| `http://localhost:5173` | Frontend application |
| `http://localhost:5000/health` | Backend health check |
| `http://localhost:5000/api/docs` | Swagger API documentation |

---

## 🔑 Default Login Credentials

> These are created automatically on first startup via database seeding.

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@mediflow.com` | `Password@123` |
| Hospital Admin | `admin@mediflow.com` | `Password@123` |
| Doctor | `doctor@mediflow.com` | `Password@123` |
| Receptionist | `receptionist@mediflow.com` | `Password@123` |
| Pharmacist | `pharmacist@mediflow.com` | `Password@123` |
| Lab Technician | `labtech@mediflow.com` | `Password@123` |
| Patient | `patient@mediflow.com` | `Password@123` |

> ⚠️ **Change all passwords immediately in production!**

---

## 📁 Project Structure

```
mediflow/
├── backend/
│   ├── config/          # Database, Swagger, Index creation
│   ├── constants/       # Roles, enums
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Auth, error, rate-limit, upload
│   ├── models/          # Mongoose schemas
│   ├── repositories/    # Data access layer
│   ├── routes/          # Express routers (with Swagger JSDoc)
│   ├── services/        # Business logic
│   ├── utils/           # ApiError, ApiResponse, Logger
│   ├── validators/      # express-validator rules
│   ├── server.js        # Application entry point
│   └── render.yaml      # Render deployment config
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components, charts
│   │   ├── context/     # AuthContext
│   │   ├── layouts/     # DashboardLayout
│   │   ├── pages/       # Feature pages per module
│   │   ├── routes/      # AppRoutes, ProtectedRoute
│   │   └── services/    # API service layer
│   └── vercel.json      # Vercel deployment config
│
└── docs/
    ├── DEPLOYMENT.md         # Full deployment guide
    ├── API_REFERENCE.md      # Human-readable API reference
    └── POSTMAN_COLLECTION.json
```

---

## 📡 API Overview

| Base Path | Module |
|-----------|--------|
| `POST /api/auth/login` | Authentication |
| `GET /api/patients` | Patient management |
| `GET /api/appointments` | Appointments |
| `GET /api/emr` | Medical records |
| `GET /api/pharmacy` | Pharmacy inventory |
| `GET /api/laboratory` | Lab tests |
| `GET /api/billing/invoices` | Invoices |
| `GET /api/billing/payments` | Payments |
| `GET /api/dashboard/admin` | Admin dashboard |
| `GET /api/dashboard/reports/revenue` | Revenue report |

Full documentation: `http://localhost:5000/api/docs`

---

## 🚢 Deployment

See [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for the complete step-by-step guide covering:
- MongoDB Atlas cluster setup
- Render backend deployment
- Vercel frontend deployment
- Environment variable configuration

---

## 🔒 Security

- JWT with short-lived access tokens (15 min) and 7-day refresh tokens via HTTP-only cookies
- Helmet.js with CSP and HSTS headers
- Rate limiting: 200 req/15min global, 10 req/15min on auth endpoints
- CORS restricted to configured origins
- Mongoose validation + express-validator on all input
- Password hashing with bcryptjs (salt rounds: 12)

---

## 📄 License

MIT © 2026 MediFlow Engineering Team
