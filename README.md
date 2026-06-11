# iTrace - Corporate Visitor Management System

A production-ready Visitor Management System for corporate offices. Visitors can check in at reception, capture a verification photo via webcam, instantly receive a printable Gate Pass PDF with a checkout QR code, and check out upon exit. Administrators can monitor visitor statistics and logs in real time via a secure admin dashboard.

---

## Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti, React-Webcam, React-Hot-Toast.
- **Backend**: AWS Lambda (TypeScript), AWS API Gateway (REST).
- **Database**: AWS DynamoDB (Single-Table/Two-Table Layout).
- **Storage**: AWS S3 (Webcam Photo uploads & PDF Gate Pass storage).
- **Auth**: JSON Web Tokens (JWT) for secure Admin access.
- **PDF Generation**: `pdf-lib` (compiled server-side inside AWS Lambda).
- **QR Code**: `qrcode` (node-compatible canvas/png buffer generation).
- **Deployment**: Serverless Framework (backend) & Vercel (frontend).

---

## Project Directory Structure
```
/
├── frontend/                        ← Next.js 15+ application
│   ├── app/
│   │   ├── page.tsx                 ← Visitor registration check-in page (public)
│   │   ├── checkout/
│   │   │   └── page.tsx             ← Visitor check-out page (public)
│   │   ├── admin/
│   │   │   ├── login/page.tsx       ← Administrative login
│   │   │   └── dashboard/page.tsx   ← Protected Admin details log dashboard
│   │   └── api/                     ← Next.js API Routes acting as Lambda Proxies
│   ├── components/
│   │   ├── WebcamCapture.tsx        ← Webcam photo capturer
│   │   ├── GatePass.tsx             ← Rendered Gate Pass visual mockup & downloader
│   │   ├── StatsCards.tsx           ← Admin dashboard statistics KPIs
│   │   └── VisitorTable.tsx         ← Searchable/filterable log table & details drawer
│   └── lib/
│       ├── api.ts                   ← REST client wrap helpers
│       ├── auth.ts                  ← JWT localStorage session handlers
│       └── lambdaProxy.ts           ← Local API-Gateway emulation bridge
│
├── backend/                         ← Lambda function code
│   ├── handlers/
│   │   ├── adminLogin.ts            ← Admin login endpoint handler
│   │   ├── createVisitor.ts         ← Check-in handler (uploads assets, prints PDF, saves data)
│   │   ├── checkoutVisitor.ts       ← Check-out handler (records timestamp, calculates duration)
│   │   ├── getVisitors.ts           ← Secure Admin logs fetcher
│   │   └── getVisitorById.ts        ← Single visitor detail fetcher
│   ├── lib/
│   │   ├── dynamo.ts                ← DynamoDB Client with local fallback
│   │   ├── s3.ts                    ← S3 Client with local static assets fallback
│   │   └── jwt.ts                   ← Token signing & verification
│   └── serverless.yml               ← Serverless Framework configuration
│
└── shared/
    └── types.ts                     ← Shared TypeScript interfaces
```

---

## Out-Of-The-Box Local Running (Mock AWS Mode)
To simplify developer setup, the database and storage clients feature a **Dual-Mode** execution system. If `MOCK_AWS=true` is set, the application saves records in a local JSON database file (`backend/local_db/db.json`) and uploads visitor photos/PDF passes directly to the frontend's static directory (`frontend/public/uploads`).

### 1. Installation
Install dependencies for both projects in one step:
```bash
npm install --prefix backend && npm install --prefix frontend
```

### 2. Environment Setup
Create the frontend environment file (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_BASE_URL=
JWT_SECRET=supersecretkey123
```
*(Leaving `NEXT_PUBLIC_API_BASE_URL` empty automatically routes browser requests to Next.js API Routes, which load the local backend handler logic directly).*

Create the backend environment file (`backend/.env`):
```env
DYNAMODB_REGION=ap-south-1
VISITORS_TABLE=visitors
ADMINS_TABLE=admins
S3_BUCKET_NAME=visitor-management-assets
JWT_SECRET=supersecretkey123
FRONTEND_URL=http://localhost:3000
MOCK_AWS=true
```

### 3. Run Locally
Start the Next.js development server:
```bash
npm run dev --prefix frontend
```
Open [http://localhost:3000](http://localhost:3000) in your web browser. You can immediately register visitors, capture webcam photos, download generated passes, check out, and browse the admin dashboard.

- **Admin Login Link**: `/admin/login`
- **Default Credentials**: `admin@company.com` / `admin123` *(Automatically seeded in Mock DB upon first login request)*.

---

## AWS Resource & Deploy Configuration

### 1. Create DynamoDB Tables
Create the following tables in AWS DynamoDB under region `ap-south-1` (or your chosen region):
*   **Table**: `visitors`
    *   Primary Key (Partition Key): `visitorId` (Type: String/S)
*   **Table**: `admins`
    *   Primary Key (Partition Key): `email` (Type: String/S)

### 2. Create S3 Bucket
Create a public S3 bucket named `visitor-management-assets` (or your choosing) to host uploaded visitor photo files and PDF gate passes.

*Configure the Bucket CORS Policy to allow PUT requests from your frontend domains:*
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### 3. Hash Default Admin Credentials
To seed your AWS DynamoDB `admins` table with the default credentials, write a record to the `admins` table using the AWS console or run the seed script:
- **Email**: `admin@company.com`
- **Password**: Hash of `admin123` using standard Bcrypt (rounds: 10). Example JSON item:
  ```json
  {
    "email": "admin@company.com",
    "passwordHash": "$2a$10$wzBqG2Wf4L4eFk/28o18i.yK3Z6K.k6lM.1tQx0e1L/Z35Z1Tf0mS"
  }
  ```

---

## Deployment Instructions

### 1. Deploy AWS Backend Lambda Functions
1.  Make sure you have the Serverless CLI installed globally: `npm install -g serverless`
2.  Set up your local AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).
3.  Navigate to the `backend/` directory, compile the TypeScript handler files, and deploy:
    ```bash
    cd backend
    npm run build
    serverless deploy
    ```
4.  Once deployed, copy the generated API Gateway URL output (e.g. `https://XXXXXX.execute-api.ap-south-1.amazonaws.com/dev`).

### 2. Deploy Next.js Frontend
1.  Set the Vercel/Production environment variables:
    *   `NEXT_PUBLIC_API_BASE_URL`: Set to the API Gateway URL generated in the previous step.
    *   `JWT_SECRET`: Set to your secure secret string (e.g., `supersecretkey123`).
2.  Deploy the `frontend/` folder directly to **Vercel** or your preferred web hosting platform.
