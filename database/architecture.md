# Backend Architecture

## Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken + bcrypt) |
| Validation | express-validator |
| Dev tools | ts-node, nodemon, eslint, prettier |

---

## Layered Architecture (Controller → Service → Repository)

```
┌──────────────────────────────────────────────────┐
│                    Routes                         │
│  (express.Router, path → handler mapping)        │
├──────────────────────────────────────────────────┤
│               Middleware Pipeline                 │
│  authMiddleware → validationMiddleware → ...     │
├──────────────────────────────────────────────────┤
│                 Controllers                       │
│  (Request/Response handling, HTTP concerns)      │
├──────────────────────────────────────────────────┤
│                  Services                         │
│  (Business logic, orchestration)                 │
├──────────────────────────────────────────────────┤
│          Prisma Client (Repository)              │
│  (Data access, auto-generated queries)           │
├──────────────────────────────────────────────────┤
│                   PostgreSQL                      │
└──────────────────────────────────────────────────┘
```

### 1. Routes Layer (`src/routes/`)

Defines endpoint mappings and wires middleware.

```
src/routes/
├── auth.routes.ts        # POST /auth/login, POST /auth/register
├── user.routes.ts        # GET/PUT /users/:id, GET /users
├── leaveType.routes.ts   # CRUD /leave-types
├── leaveRequest.routes.ts # CRUD /leave-requests, PATCH /:id/approve
├── leaveBalance.routes.ts # GET /leave-balances
└── auditLog.routes.ts    # GET /audit-logs
```

### 2. Middleware Pipeline (`src/middleware/`)

```
src/middleware/
├── auth.middleware.ts     # JWT verification, attaches req.user
├── role.middleware.ts     # Role-based access (EMPLOYEE / MANAGER)
├── validate.middleware.ts # Runs express-validator checks
├── error.middleware.ts    # Global error handler
└── audit.middleware.ts    # Logs requests to audit_logs table
```

### 3. Controllers (`src/controllers/`)

Thin layer — parses request, calls service, formats response.

```typescript
// Pattern:
export const getLeaveRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await leaveRequestService.findAll(req.query);
    res.status(200).json(successResponse(result));
  } catch (error) {
    next(error);
  }
};
```

### 4. Services (`src/services/`)

Contains all business logic. Controllers delegate to services.

```typescript
// Pattern:
export class LeaveRequestService {
  async findAll(filters: LeaveRequestFilters): Promise<PaginatedResult<LeaveRequest>> {
    // Authorization checks
    // Business rule validation
    // Call Prisma queries
    // Return paginated result
  }
}
```

### 5. Prisma Schema (`prisma/schema.prisma`)

Single source of truth for the data model. Maps directly to the database.

```
prisma/
├── schema.prisma       # Data model, enums, relations
├── migrations/         # Auto-generated migration files
└── seed.ts             # Default data seeder
```

---

## Authentication Flow (JWT)

```
1. POST /auth/login
   → Validate email + password
   → Compare bcrypt hash
   → Generate JWT (payload: { userId, role })
   → Return { token, user }

2. Every protected route
   → authMiddleware extracts Bearer token
   → Verifies JWT signature + expiry
   → Attaches decoded payload to req.user
   → roleMiddleware checks required role

3. JWT Configuration
   - Secret: env var JWT_SECRET
   - Expiry: env var JWT_EXPIRES_IN (default 24h)
   - Algorithm: HS256
```

---

## Validation Layer

Each route defines its validation rules using `express-validator`:

```typescript
// Pattern:
export const createLeaveRequestRules = [
  body('leaveTypeId').isUUID().withMessage('Invalid leave type'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
  body('reason').isString().isLength({ min: 10 }).withMessage('Reason must be at least 10 characters'),
  body('startDate').custom((start, { req }) => {
    if (new Date(start) > new Date(req.body.endDate)) {
      throw new Error('Start date must be before end date');
    }
    return true;
  }),
];
```

---

## Utility Modules

### `src/utils/response.ts`

Standardized API response helpers:

```typescript
export const successResponse = (data: any, message = 'Success') => ({
  success: true,
  message,
  data,
});

export const errorResponse = (message: string, statusCode: number, errors?: any) => ({
  success: false,
  message,
  statusCode,
  errors,
});

export const paginatedResponse = (data: any[], total: number, page: number, limit: number) => ({
  success: true,
  data,
  pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
});
```

### `src/utils/pagination.ts`

Reusable pagination & filtering helper:

```typescript
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const getPaginationParams = (query: any): PaginationParams => ({
  page: Math.max(1, parseInt(query.page) || 1),
  limit: Math.min(100, Math.max(1, parseInt(query.limit) || 10)),
  sortBy: query.sortBy || 'createdAt',
  sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc',
});
```

### `src/utils/errors.ts`

Custom error classes:

```typescript
export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', public errors?: any) {
    super(422, message);
  }
}
```

---

## Seed Script (`prisma/seed.ts`)

Populates the database with default data on first setup:

```typescript
// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Default leave types
  const leaveTypes = await Promise.all([
    prisma.leaveType.create({ data: { name: 'Annual Leave', code: 'ANNUAL', defaultDays: 20, requiresApproval: true } }),
    prisma.leaveType.create({ data: { name: 'Sick Leave', code: 'SICK', defaultDays: 12, requiresApproval: false } }),
    prisma.leaveType.create({ data: { name: 'Personal Leave', code: 'PERSONAL', defaultDays: 5, requiresApproval: true } }),
    prisma.leaveType.create({ data: { name: 'Maternity Leave', code: 'MATERNITY', defaultDays: 90, requiresApproval: true } }),
    prisma.leaveType.create({ data: { name: 'Paternity Leave', code: 'PATERNITY', defaultDays: 10, requiresApproval: true } }),
  ]);

  // 2. Default admin/manager account
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@proteccio.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: Role.MANAGER,
      department: 'Management',
      designation: 'Administrator',
    },
  });

  // 3. Create leave balances for admin
  await Promise.all(
    leaveTypes.map((lt) =>
      prisma.leaveBalance.create({
        data: {
          userId: admin.id,
          leaveTypeId: lt.id,
          year: new Date().getFullYear(),
          totalDays: lt.defaultDays,
          usedDays: 0,
          remainingDays: lt.defaultDays,
        },
      })
    )
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

---

## Project Structure

```
src/
├── app.ts                       # Express app setup (middleware, routes, error handler)
├── server.ts                    # Entry point — starts HTTP server
├── config/
│   └── env.ts                   # Env var loading & validation
├── routes/
│   ├── index.ts                 # Route aggregator
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── leaveType.routes.ts
│   ├── leaveRequest.routes.ts
│   ├── leaveBalance.routes.ts
│   └── auditLog.routes.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── leaveType.controller.ts
│   ├── leaveRequest.controller.ts
│   ├── leaveBalance.controller.ts
│   └── auditLog.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── leaveType.service.ts
│   ├── leaveRequest.service.ts
│   ├── leaveBalance.service.ts
│   └── auditLog.service.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── role.middleware.ts
│   ├── validate.middleware.ts
│   ├── error.middleware.ts
│   └── audit.middleware.ts
├── validators/
│   ├── auth.validator.ts
│   ├── user.validator.ts
│   ├── leaveType.validator.ts
│   └── leaveRequest.validator.ts
├── utils/
│   ├── response.ts
│   ├── pagination.ts
│   ├── errors.ts
│   └── jwt.ts
└── types/
    ├── express.d.ts             # Express Request augmentation
    └── index.ts                 # Shared TypeScript interfaces
```

---

## Environment Variables

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/proteccio"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV=development
```

---

## Scripts

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "ts-node prisma/seed.ts",
    "prisma:reset": "prisma migrate reset",
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit"
  }
}
```
