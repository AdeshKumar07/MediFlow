# MediFlow — API Reference Manual

This manual provides an offline reference for the key API endpoints of the MediFlow platform.

---

## Base Path
All API routes are prefixed with `/api`.

---

## 1. Authentication (`/api/auth`)

### Register User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "Password@123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PATIENT"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "User registered successfully",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "603d3f5451a5c64f7c10b7a8",
        "username": "johndoe",
        "role": "PATIENT"
      }
    }
  }
  ```

### Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "password": "Password@123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Login successful",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

## 2. Patients (`/api/patients`)

### Get Patients List (Paginated)
- **Method**: `GET`
- **Path**: `/api/patients`
- **Headers**:
  - `Authorization: Bearer <accessToken>`
- **Response**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "patients": [
        {
          "_id": "603d3f5451a5c64f7c10b7a9",
          "firstName": "John",
          "lastName": "Doe"
        }
      ]
    }
  }
  ```

---

## 3. Appointments (`/api/appointments`)

### Book Appointment
- **Method**: `POST`
- **Path**: `/api/appointments`
- **Headers**:
  - `Authorization: Bearer <accessToken>`
- **Request Body**:
  ```json
  {
    "patientId": "603d3f5451a5c64f7c10b7a9",
    "doctorId": "603d3f5451a5c64f7c10b7b1",
    "date": "2026-07-10T00:00:00.000Z",
    "timeSlot": "10:00 AM - 10:30 AM",
    "reason": "Routine general health checkup"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "message": "Appointment booked successfully"
  }
  ```

---

## 4. Billing (`/api/billing`)

### Create Invoice
- **Method**: `POST`
- **Path**: `/api/billing/invoices`
- **Headers**:
  - `Authorization: Bearer <accessToken>`
- **Request Body**:
  ```json
  {
    "patientId": "603d3f5451a5c64f7c10b7a9",
    "items": [
      {
        "description": "General Consultation",
        "category": "consultation",
        "quantity": 1,
        "unitPrice": 500
      }
    ],
    "discountType": "percentage",
    "discountValue": 10,
    "taxRate": 18
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "statusCode": 201,
    "data": {
      "invoice": {
        "_id": "603d3f5451a5c64f7c10b7c5",
        "invoiceNumber": "INV-2026-0001",
        "totalAmount": 531
      }
    }
  }
  ```
