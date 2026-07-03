# Proteccio - Employee Leave Management System

## Project Overview

### Business Problem
Organizations struggle with inefficient leave management processes. Manual tracking, email-based approvals, and spreadsheet systems lead to errors, delays, and poor visibility into team availability.

### Purpose
Proteccio is a full-stack leave management application that digitizes and automates the employee leave request workflow. It provides a centralized platform for employees to submit leave requests, managers to approve or reject them, and teams to monitor leave patterns.

### Who Can Use It
- **Employees**: Submit leave requests, view history, check balances
- **Managers**: Review and approve/reject requests, manage employees

## Features

### Authentication
- JWT-based authentication with bcrypt password hashing
- Role-based access control (Employee and Manager)

### Employee Features
- Submit leave requests with multiple leave types
- View personal leave history with status filtering
- Cancel pending leave requests
- Check leave balance by type

### Manager Features
- Approve or reject leave requests with comments
- View team leave requests with filters
- Manage employee profiles
- Deactivate employee accounts

### Dashboard Features
- Leave statistics overview
- Personal leave balances summary
- Recent leave requests view

### Security Features
- Password hashing (bcrypt, 12 rounds)
- JWT tokens (8h expiration)
- Role-based authorization
- CORS + Helmet security headers
- Input validation (client + server)

### Bonus Features
- Audit logging for critical actions
- Pagination across all list views
- Responsive design with Tailwind CSS
- Swagger/OpenAPI documentation
- Postman collection included

## Technology Stack

### Frontend
React 18, Vite 6, TypeScript, React Router DOM, TanStack Query, React Hook Form, Zod, Axios, Tailwind CSS, shadcn/ui, Lucide React, Sonner

### Backend
Node.js, Express.js, TypeScript, PostgreSQL, Prisma ORM, bcryptjs, jsonwebtoken, express-validator, swagger-jsdoc, swagger-ui-express, helmet, cors, morgan

### Database
PostgreSQL 15+, Prisma Client

### Authentication
JWT + bcrypt

### API Documentation
Swagger/OpenAPI 3.0 at `/api-docs`

## Folder Structure

```
proteccio/
├── README.md
├── .gitignore
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── app.ts
│       ├── index.ts
│       ├── seed.ts
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── types/
│       ├── utils/
│       └── validators/
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── types/
│       ├── contexts/
│       ├── lib/
│       ├── pages/
│       ├── components/
│       │   ├── layout/
│       │   └── ui/
│       └── services/
├── database/
│   ├── ERD.md
│   ├── architecture.md
│   └── database-schema.md
├── docs/
│   ├── architecture.md
│   └── database-schema.md
└── postman/
    └── Proteccio.postman_collection.json
```

## Installation

### Prerequisites
- Node.js v18+, npm/yarn, PostgreSQL 15+, Git

### Clone Repository
```bash
git clone <repository-url>
cd proteccio
```

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL connection string
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://postgres:password@localhost:5432/proteccio |
| JWT_SECRET | Secret key for JWT signing | your-super-secret-jwt-key-change-in-production |
| JWT_EXPIRES_IN | Token expiration time | 8h |
| JWT_REFRESH_SECRET | Refresh token secret | your-refresh-secret-key-change-in-production |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiration | 7d |
| PORT | Backend server port | 4000 |
| NODE_ENV | Environment | development |
| CORS_ORIGIN | Frontend URL for CORS | http://localhost:5173 |

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Manager | manager@proteccio.com | Password123 |
| Employee | employee@proteccio.com | Password123 |

## API Documentation

Interactive Swagger docs: **http://localhost:4000/api-docs**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register | No |
| POST | /api/auth/login | Login | No |
| GET | /api/auth/profile | Get profile | Yes |
| GET | /api/users | List users | Manager |
| PUT | /api/users/:id | Update user | Manager |
| DELETE | /api/users/:id | Deactivate user | Manager |
| POST | /api/leaves | Create leave | Yes |
| GET | /api/leaves | List leaves | Yes |
| PATCH | /api/leaves/:id/status | Approve/reject | Manager |
| PATCH | /api/leaves/:id/cancel | Cancel own | Yes |

## Database Design

### Tables
- **users** — Employee and manager accounts
- **leave_types** — Leave categories (Annual, Sick, Personal, etc.)
- **leave_balances** — Annual leave balance per user per type
- **leave_requests** — Leave applications with approval workflow
- **audit_logs** — Activity tracking

### Relationships
- User 1:M LeaveRequest, LeaveBalance, AuditLog
- LeaveType 1:M LeaveRequest, LeaveBalance
- Cascading: CASCADE on user delete, RESTRICT on leave type, SET NULL on approver

## Security
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens signed with secret key
- Role-based route authorization
- Input validation on client (Zod) and server (express-validator)
- CORS restricted to frontend origin
- Helmet security headers

## License
MIT
