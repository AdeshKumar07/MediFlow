# MediFlow Backend

Express.js + MongoDB REST API for the MediFlow Hospital Management SaaS platform.

---

## Architecture

```
Request → [requestId] → [helmet] → [cors] → [rateLimit] → [morgan]
        → [bodyParser] → [cookieParser]
        → Routes → [protect] → [authorize] → [validator] → Controller
        → Service → Repository → MongoDB
        → Response → [errorHandler]
```

### Layer Responsibilities

| Layer | Role |
|-------|------|
| **Routes** | URL mapping, auth guards, validator chains, Swagger docs |
| **Controllers** | HTTP request/response handling, calls services |
| **Services** | Business logic, MongoDB aggregation pipelines |
| **Repositories** | Mongoose query abstraction (DRY data access) |
| **Middlewares** | Cross-cutting: auth, error, rate-limit, upload, requestId |
| **Validators** | Input sanitization/validation via express-validator |
| **Utils** | ApiError, ApiResponse, Logger |

---

## Folder Structure

```
backend/
├── config/
│   ├── db.js          # Mongoose connection + index creation + seeding
│   ├── indexes.js     # All production MongoDB indexes (idempotent)
│   └── swagger.js     # OpenAPI 3.0 spec + all reusable schemas
├── constants/
│   └── roles.js       # ROLES enum (SUPER_ADMIN → PATIENT)
├── controllers/       # One controller per module
├── middlewares/
│   ├── auth.middleware.js      # protect() + authorize()
│   ├── error.middleware.js     # Global error handler
│   ├── rateLimit.middleware.js # globalLimiter / authLimiter / reportLimiter
│   ├── requestId.middleware.js # X-Request-ID header
│   └── upload.middleware.js    # Multer config (PDF/images)
├── models/            # Mongoose schemas
├── repositories/      # Data access objects
├── routes/            # Express routers with JSDoc @swagger annotations
├── services/          # Business logic + MongoDB aggregation
├── utils/
│   ├── apiError.js    # Custom error class
│   ├── apiResponse.js # Standard response envelope
│   └── logger.js      # Console logger with color
├── validators/        # express-validator rule chains per module
├── server.js          # Entry point
├── render.yaml        # Render deployment config
├── .env.example       # Environment variable template
└── package.json
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | HTTP server port |
| `NODE_ENV` | Yes | `development` | `development` / `production` / `test` |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Yes | — | 64-byte hex secret for access tokens |
| `JWT_REFRESH_SECRET` | Yes | — | 64-byte hex secret for refresh tokens |
| `JWT_ACCESS_EXPIRATION` | No | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRATION` | No | `7d` | Refresh token TTL |
| `ALLOWED_ORIGINS` | Yes | — | Comma-separated CORS origins |
| `RAZORPAY_KEY_ID` | Yes | — | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | Yes | — | Razorpay secret |
| `DEBUG_DOCS` | No | `false` | Enable Swagger UI in production |

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Running Locally

```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env

# Development (with nodemon hot-reload)
npm run dev

# Production
npm start
```

---

## API Rate Limits

| Scope | Limit | Window |
|-------|-------|--------|
| All `/api/*` routes | 200 requests | 15 minutes |
| Auth endpoints | 10 requests | 15 minutes |
| Report endpoints | 30 requests | 15 minutes |

Rate limit headers are returned in every response (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`).

---

## Auth Flow

```
1. POST /api/auth/login  →  { accessToken }  +  Set-Cookie: refreshToken (HttpOnly)
2. Include Authorization: Bearer <accessToken> in all protected requests
3. Access token expires in 15 min → POST /api/auth/refresh (uses cookie)
4. POST /api/auth/logout  →  clears cookie, invalidates refresh token in DB
```

---

## Error Response Format

All errors follow this envelope:

```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is required" }
  ],
  "requestId": "uuid-v4"
}
```

---

## MongoDB Indexes

All indexes are created idempotently on startup via `config/indexes.js`.
Key indexes:

- **User**: `email` (unique), `username` (unique), `role + isActive`
- **Appointment**: `{ doctorId, date }`, `{ patientId, date }`, `{ status, date }`
- **Invoice**: `{ patientId, status }`, `{ status, createdAt }`
- **Token**: TTL index on `expiresAt` (auto-deletes expired refresh tokens)

---

## API Documentation

Swagger UI: `http://localhost:5000/api/docs`  
Raw OpenAPI JSON: `http://localhost:5000/api/docs.json`
