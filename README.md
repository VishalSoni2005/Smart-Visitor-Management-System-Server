# vTrace — Smart Visitor Management System

A production-ready Visitor Management System built for corporate offices and reception desks.

Visitors can:

- Register at reception
- Capture a verification photo using their webcam
- Receive an automatically generated Gate Pass PDF
- Enter a unique code to complete checkout

Administrators can:

- Securely authenticate
- Monitor visitor activity
- Track active and checked-out visitors
- View visitor history and analytics

---

## Live Demo

Frontend Application

https://dev.d1mzxxwic3lv56.amplifyapp.com/

Repository

https://github.com/VishalSoni2005/Smart-Visitor-Management-System-Server

---

# Problem Statement

Traditional visitor registers are difficult to maintain, search, and audit.

This system digitizes the visitor lifecycle:

Check-In → Photo Verification → Gate Pass Generation → Code Checkout → Admin Monitoring

The solution provides:

- Digital visitor records
- Secure visitor verification
- Automated gate pass generation
- Real-time visitor tracking
- Centralized administrative management

---

# Features

## Visitor Features

- Visitor registration
- Webcam photo capture
- Automatic Gate Pass PDF generation
- Code-based checkout
- Visitor tracking with timestamps

## Admin Features

- Secure JWT authentication
- Visitor dashboard
- Active visitor statistics
- Complete visitor logs
- Individual visitor detail view

## System Features

- Serverless backend architecture
- AWS cloud-native deployment
- S3 asset storage
- DynamoDB persistence
- Secure API access
- Responsive UI

---

# Tech Stack

## Frontend

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React Webcam
- React Hot Toast
- Lucide React
- Canvas Confetti

## Backend

- AWS Lambda
- AWS API Gateway
- TypeScript
- Serverless Framework

## Cloud Services

### AWS DynamoDB

Stores:

- Visitor records
- Admin accounts

### AWS S3

Stores:

- Visitor photographs
- Generated Gate Pass PDFs

## Authentication

- JWT (JSON Web Tokens)

## PDF Generation

- pdf-lib

## QR Code Generation

- qrcode

---

# Architecture Overview

```text
┌──────────────┐
│ Visitor UI   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Next.js App  │
└──────┬───────┘
       │ REST API
       ▼
┌─────────────────────┐
│ API Gateway         │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ AWS Lambda          │
│ Business Logic      │
└──────┬──────┬───────┘
       │      │
       ▼      ▼
 DynamoDB    S3
```

---

# Repository Structure

```text
.
├── backend/
│
│   ├── handlers/
│   │   ├── adminLogin.ts
│   │   ├── createVisitor.ts
│   │   ├── checkoutVisitor.ts
│   │   ├── getVisitors.ts
│   │   └── getVisitorById.ts
│   │
│   ├── lib/
│   │   ├── dynamo.ts
│   │   ├── jwt.ts
│   │   ├── multipart.ts
│   │   └── s3.ts
│   │
│   ├── serverless.yml
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│
│   ├── app/
│   │   ├── page.tsx
│   │   ├── checkout/
│   │   │   └── page.tsx
│   │   └── admin/
│   │       ├── login/
│   │       │   └── page.tsx
│   │       └── dashboard/
│   │           └── page.tsx
│   │
│   ├── components/
│   │   ├── GatePass.tsx
│   │   ├── StatsCards.tsx
│   │   ├── VisitorTable.tsx
│   │   └── WebcamCapture.tsx
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── lambdaProxy.ts
│   │
│   ├── shared/
│   │   └── types.ts
│   │
│   └── package.json
│
└── README.md
```

---

# Frontend Navigation Guide

## Public Routes

### `/`

Visitor Check-In page

Responsibilities:

- Collect visitor details
- Capture visitor photo
- Submit registration
- Generate Gate Pass

---

### `/checkout`

Visitor Checkout page

Responsibilities:

- Accept checkout code
- Complete visitor exit process
- Record checkout timestamp

---

## Protected Routes

### `/admin/login`

Administrator authentication page

Responsibilities:

- Validate admin credentials
- Generate JWT token
- Create authenticated session

---

### `/admin/dashboard`

Administrative dashboard

Responsibilities:

- View visitor statistics
- Monitor active visitors
- Search visitor records
- Inspect visitor details

---

# Backend API Endpoints

| Method | Endpoint         | Description                |
| ------ | ---------------- | -------------------------- |
| POST   | `/admin/login`   | Authenticate administrator |
| POST   | `/visitors`      | Register visitor           |
| POST   | `/checkout`      | Checkout visitor           |
| GET    | `/visitors`      | Retrieve visitor list      |
| GET    | `/visitors/{id}` | Retrieve visitor details   |

---

# Database Design

## Visitors Table

Partition Key

```text
visitorId
```

Stores:

- Visitor information
- Photo URL
- Gate Pass URL
- Check-in timestamp
- Check-out timestamp
- Visit status

---

## Admins Table

Partition Key

```text
email
```

Stores:

- Admin email
- Password hash

---

# AWS Resources

## DynamoDB Tables

### visitors

```text
visitorId (PK)
```

### admins

```text
email (PK)
```

---

## S3 Bucket

Stores:

- Visitor photographs
- Generated PDFs

Example:

```text
visitor-management-assets
```

---

# Environment Variables

## Backend

```env
AWS_REGION=
VISITORS_TABLE=
ADMINS_TABLE=
S3_BUCKET=
JWT_SECRET=
```

## Frontend

```env
NEXT_PUBLIC_API_URL=
```

---

# Local Development

## Clone Repository

```bash
git clone https://github.com/VishalSoni2005/Smart-Visitor-Management-System-Server.git

cd Smart-Visitor-Management-System-Server
```

## Backend Setup

```bash
cd backend

npm install

npm run build

serverless offline
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Application:

```text
http://localhost:3000
```

---

# Security Considerations

- JWT-based admin authentication
- Passwords stored as bcrypt hashes
- Protected administrative APIs
- Server-side PDF generation
- AWS IAM controlled resource access
- Validation of uploaded visitor assets

---

# Design Decisions

### Why Serverless?

- Cost efficient
- Auto-scaling
- No server management
- Fast deployment cycle

### Why DynamoDB?

- Low operational overhead
- High scalability
- Excellent fit for event-driven workloads

### Why S3?

- Durable object storage
- Cost effective
- Easy integration with Lambda

### Why Next.js?

- Modern React architecture
- Fast rendering
- Excellent developer experience

---

# Future Improvements

- Email gate pass delivery
- Visitor pre-registration
- Host approval workflow
- Role-based admin access
- Visitor analytics dashboard
- Multi-office support
- Audit logging

---

# Author

**Vishal Soni**

Full Stack Developer

Portfolio:
https://vsoni.vercel.app/

GitHub:
https://github.com/VishalSoni2005
