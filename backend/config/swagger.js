'use strict';

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'MediFlow — Hospital Management SaaS API',
      version: '1.0.0',
      description: `
## Overview
MediFlow is a multi-role, enterprise-grade Hospital Management SaaS platform.
This API powers all clinical, administrative, pharmacy, laboratory, and billing operations.

## Authentication
All protected routes require a **Bearer JWT** token in the \`Authorization\` header.

\`\`\`
Authorization: Bearer <your_access_token>
\`\`\`

Obtain a token via \`POST /api/auth/login\`. Tokens expire in 15 minutes.
Use \`POST /api/auth/refresh\` (with HTTP-only cookie) to obtain a new access token.

## Roles
| Role | Description |
|---|---|
| \`SUPER_ADMIN\` | Full system access |
| \`HOSPITAL_ADMIN\` | Full hospital access |
| \`DOCTOR\` | Clinical operations |
| \`RECEPTIONIST\` | Patient registration & scheduling |
| \`PHARMACIST\` | Pharmacy inventory |
| \`LAB_TECH\` | Laboratory operations |
| \`PATIENT\` | Own data only |

## Rate Limits
| Scope | Limit |
|---|---|
| Global API | 200 requests / 15 min |
| Auth endpoints | 10 requests / 15 min |
| Report generation | 30 requests / 15 min |

## Error Format
All errors return:
\`\`\`json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "errors": [],
  "requestId": "uuid-v4"
}
\`\`\`
      `,
      contact: {
        name: 'MediFlow Engineering',
        email: 'dev@mediflow.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server'
      },
      {
        url: 'https://mediflow-api.onrender.com',
        description: 'Production Server (Render)'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token'
        }
      },
      schemas: {
        // ── Common ────────────────────────────────────────────────────
        ApiResponse: {
          type: 'object',
          properties: {
            success:    { type: 'boolean', example: true },
            statusCode: { type: 'integer', example: 200 },
            message:    { type: 'string',  example: 'Success' },
            data:       { type: 'object'  },
            requestId:  { type: 'string',  format: 'uuid' }
          }
        },
        ApiError: {
          type: 'object',
          properties: {
            success:    { type: 'boolean', example: false },
            statusCode: { type: 'integer', example: 400 },
            message:    { type: 'string',  example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field:   { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Email is required' }
                }
              }
            },
            requestId: { type: 'string', format: 'uuid' }
          }
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 100 },
            page:  { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            pages: { type: 'integer', example: 5 }
          }
        },

        // ── User / Auth ───────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            _id:          { type: 'string', example: '6660abc123def456' },
            username:     { type: 'string', example: 'johndoe' },
            email:        { type: 'string', format: 'email', example: 'john@example.com' },
            role:         { type: 'string', enum: ['SUPER_ADMIN','HOSPITAL_ADMIN','DOCTOR','RECEPTIONIST','PHARMACIST','LAB_TECH','PATIENT'] },
            firstName:    { type: 'string', example: 'John' },
            lastName:     { type: 'string', example: 'Doe' },
            profileImage: { type: 'string', example: '/uploads/profile.jpg' },
            isActive:     { type: 'boolean', example: true },
            createdAt:    { type: 'string', format: 'date-time' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['username','email','password','firstName','lastName'],
          properties: {
            username:  { type: 'string', minLength: 3, example: 'johndoe' },
            email:     { type: 'string', format: 'email', example: 'john@example.com' },
            password:  { type: 'string', minLength: 6,   example: 'Password@123' },
            firstName: { type: 'string', example: 'John' },
            lastName:  { type: 'string', example: 'Doe' },
            role:      { type: 'string', enum: ['SUPER_ADMIN','HOSPITAL_ADMIN','DOCTOR','RECEPTIONIST','PHARMACIST','LAB_TECH','PATIENT'] }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['emailOrUsername','password'],
          properties: {
            emailOrUsername: { type: 'string', example: 'john@example.com' },
            password:        { type: 'string', example: 'Password@123' }
          }
        },
        TokenResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGciOi...' },
            user:        { $ref: '#/components/schemas/User' }
          }
        },

        // ── Appointment ───────────────────────────────────────────────
        Appointment: {
          type: 'object',
          properties: {
            _id:        { type: 'string' },
            patientId:  { type: 'string' },
            doctorId:   { type: 'string' },
            branchId:   { type: 'string' },
            date:       { type: 'string', format: 'date', example: '2026-08-15' },
            timeSlot:   { type: 'string', example: '09:00 AM - 09:30 AM' },
            status:     { type: 'string', enum: ['PENDING','CONFIRMED','COMPLETED','CANCELLED','RESCHEDULED'] },
            reason:     { type: 'string', example: 'Routine checkup' },
            queueNumber:{ type: 'integer', example: 5 },
            notes:      { type: 'string' },
            createdAt:  { type: 'string', format: 'date-time' }
          }
        },
        BookAppointmentRequest: {
          type: 'object',
          required: ['patientId','doctorId','branchId','date','timeSlot','reason'],
          properties: {
            patientId: { type: 'string' },
            doctorId:  { type: 'string' },
            branchId:  { type: 'string' },
            date:      { type: 'string', format: 'date' },
            timeSlot:  { type: 'string', example: '10:00 AM - 10:30 AM' },
            reason:    { type: 'string', example: 'Fever and headache' },
            notes:     { type: 'string' }
          }
        },

        // ── Medicine ──────────────────────────────────────────────────
        Medicine: {
          type: 'object',
          properties: {
            _id:          { type: 'string' },
            name:         { type: 'string', example: 'Paracetamol 500mg' },
            brand:        { type: 'string', example: 'Calpol' },
            category:     { type: 'string', example: 'Analgesic' },
            price:        { type: 'number', example: 12.50 },
            stock:        { type: 'integer', example: 200 },
            expiryDate:   { type: 'string', format: 'date' },
            batchNumber:  { type: 'string', example: 'BATCH-2024-001' },
            manufacturer: { type: 'string', example: 'GSK' },
            dosage:       { type: 'string', example: '500mg twice daily' }
          }
        },

        // ── Invoice ───────────────────────────────────────────────────
        Invoice: {
          type: 'object',
          properties: {
            _id:           { type: 'string' },
            invoiceNumber: { type: 'string', example: 'INV-000001' },
            patientId:     { type: 'string' },
            appointmentId: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  category:    { type: 'string', enum: ['consultation','medicine','laboratory','other'] },
                  quantity:    { type: 'integer' },
                  unitPrice:   { type: 'number' },
                  amount:      { type: 'number' }
                }
              }
            },
            subtotal:      { type: 'number', example: 1500 },
            discountType:  { type: 'string', enum: ['percentage','fixed'] },
            discountValue: { type: 'number', example: 10 },
            taxRate:       { type: 'number', example: 18 },
            totalAmount:   { type: 'number', example: 1620 },
            status:        { type: 'string', enum: ['DRAFT','PENDING','PAID','PARTIALLY_PAID','CANCELLED'] },
            dueDate:       { type: 'string', format: 'date' },
            createdAt:     { type: 'string', format: 'date-time' }
          }
        },

        // ── Payment ───────────────────────────────────────────────────
        Payment: {
          type: 'object',
          properties: {
            _id:               { type: 'string' },
            invoiceId:         { type: 'string' },
            patientId:         { type: 'string' },
            amount:            { type: 'number', example: 1620 },
            currency:          { type: 'string', example: 'INR' },
            status:            { type: 'string', enum: ['CREATED','SUCCESS','FAILED','REFUNDED'] },
            paymentMethod:     { type: 'string', example: 'upi' },
            razorpayOrderId:   { type: 'string' },
            razorpayPaymentId: { type: 'string' },
            receiptNumber:     { type: 'string', example: 'RCP-000001' },
            paidAt:            { type: 'string', format: 'date-time' }
          }
        },

        // ── Lab Test ──────────────────────────────────────────────────
        LabTest: {
          type: 'object',
          properties: {
            _id:         { type: 'string' },
            patientId:   { type: 'string' },
            doctorId:    { type: 'string' },
            testName:    { type: 'string', example: 'Complete Blood Count' },
            testCode:    { type: 'string', example: 'CBC' },
            status:      { type: 'string', enum: ['PENDING','IN_PROGRESS','COMPLETED','CANCELLED'] },
            results:     { type: 'string' },
            reportUrl:   { type: 'string' },
            remarks:     { type: 'string' },
            completedAt: { type: 'string', format: 'date-time' },
            createdAt:   { type: 'string', format: 'date-time' }
          }
        },

        // ── Patient Profile ───────────────────────────────────────────
        PatientProfile: {
          type: 'object',
          properties: {
            _id:         { type: 'string' },
            userId:      { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            gender:      { type: 'string', enum: ['Male','Female','Other'] },
            bloodGroup:  { type: 'string', enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
            allergies:   { type: 'array', items: { type: 'string' } },
            medicalHistory: { type: 'array', items: { type: 'string' } },
            emergencyContact: {
              type: 'object',
              properties: {
                name:     { type: 'string' },
                relation: { type: 'string' },
                phone:    { type: 'string' }
              }
            }
          }
        }
      }
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth',         description: 'Authentication & token management' },
      { name: 'Dashboard',    description: 'Role-based dashboard metrics & charts' },
      { name: 'Reports',      description: 'Revenue, patient, and appointment reports' },
      { name: 'Patients',     description: 'Patient registration & profile management' },
      { name: 'Appointments', description: 'Appointment booking & scheduling' },
      { name: 'Pharmacy',     description: 'Medicine inventory & prescriptions' },
      { name: 'Laboratory',   description: 'Lab tests & report management' },
      { name: 'Billing',      description: 'Invoices & payment processing' },
      { name: 'Hospital',     description: 'Hospital, branches & departments' },
      { name: 'Staff',        description: 'Staff directory & profiles' },
      { name: 'System',       description: 'Health check & system info' }
    ]
  },
  // Scan route files for JSDoc @swagger annotations
  apis: ['./routes/*.routes.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
