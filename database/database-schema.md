# Proteccio Database Schema

## Overview

PostgreSQL relational schema for the Proteccio Employee Leave Management System.

---

## Table: `users`

Stores all employee and manager accounts.

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | `PRIMARY KEY` , `DEFAULT uuid_generate_v4()` |
| `email` | VARCHAR(255) | `NOT NULL` , `UNIQUE` |
| `password` | VARCHAR(255) | `NOT NULL` |
| `firstName` | VARCHAR(100) | `NOT NULL` |
| `lastName` | VARCHAR(100) | `NOT NULL` |
| `role` | ENUM('EMPLOYEE', 'MANAGER') | `NOT NULL` , `DEFAULT 'EMPLOYEE'` |
| `department` | VARCHAR(100) | `NOT NULL` |
| `designation` | VARCHAR(100) | `NOT NULL` |
| `isActive` | BOOLEAN | `NOT NULL` , `DEFAULT true` |
| `createdAt` | TIMESTAMPTZ | `NOT NULL` , `DEFAULT NOW()` |
| `updatedAt` | TIMESTAMPTZ | `NOT NULL` , `DEFAULT NOW()` |

---

## Table: `leave_types`

Defines the categories of leave available in the system.

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | `PRIMARY KEY` , `DEFAULT uuid_generate_v4()` |
| `name` | VARCHAR(100) | `NOT NULL` |
| `code` | VARCHAR(20) | `NOT NULL` , `UNIQUE` |
| `description` | TEXT | |
| `defaultDays` | INTEGER | `NOT NULL` |
| `requiresApproval` | BOOLEAN | `NOT NULL` , `DEFAULT true` |
| `isActive` | BOOLEAN | `NOT NULL` , `DEFAULT true` |
| `createdAt` | TIMESTAMPTZ | `NOT NULL` , `DEFAULT NOW()` |
| `updatedAt` | TIMESTAMPTZ | `NOT NULL` , `DEFAULT NOW()` |

---

## Table: `leave_balances`

Tracks annual leave entitlement per user per leave type.

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | `PRIMARY KEY` , `DEFAULT uuid_generate_v4()` |
| `userId` | UUID | `NOT NULL` , `FOREIGN KEY → users(id) ON DELETE CASCADE` |
| `leaveTypeId` | UUID | `NOT NULL` , `FOREIGN KEY → leave_types(id) ON DELETE RESTRICT` |
| `year` | INTEGER | `NOT NULL` |
| `totalDays` | DECIMAL(5, 1) | `NOT NULL` |
| `usedDays` | DECIMAL(5, 1) | `NOT NULL` , `DEFAULT 0` |
| `remainingDays` | DECIMAL(5, 1) | `NOT NULL` , `DEFAULT 0` |
| `createdAt` | TIMESTAMPTZ | `NOT NULL` , `DEFAULT NOW()` |
| `updatedAt` | TIMESTAMPTZ | `NOT NULL` , `DEFAULT NOW()` |

**Unique constraint:** `(userId, leaveTypeId, year)`

---

## Table: `leave_requests`

Records every leave application submitted by employees.

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | `PRIMARY KEY` , `DEFAULT uuid_generate_v4()` |
| `userId` | UUID | `NOT NULL` , `FOREIGN KEY → users(id) ON DELETE CASCADE` |
| `leaveTypeId` | UUID | `NOT NULL` , `FOREIGN KEY → leave_types(id) ON DELETE RESTRICT` |
| `startDate` | DATE | `NOT NULL` |
| `endDate` | DATE | `NOT NULL` |
| `reason` | TEXT | `NOT NULL` |
| `status` | ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') | `NOT NULL` , `DEFAULT 'PENDING'` |
| `approverId` | UUID | `FOREIGN KEY → users(id) ON DELETE SET NULL` |
| `approverComment` | TEXT | |
| `appliedAt` | TIMESTAMPTZ | `NOT NULL` , `DEFAULT NOW()` |
| `reviewedAt` | TIMESTAMPTZ | |
| `createdAt` | TIMESTAMPTZ | `NOT NULL` , `DEFAULT NOW()` |
| `updatedAt` | TIMESTAMPTZ | `NOT NULL` , `DEFAULT NOW()` |

---

## Table: `audit_logs`

Immutable audit trail for security and compliance.

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | `PRIMARY KEY` , `DEFAULT uuid_generate_v4()` |
| `userId` | UUID | `FOREIGN KEY → users(id) ON DELETE SET NULL` |
| `action` | VARCHAR(50) | `NOT NULL` |
| `entity` | VARCHAR(50) | `NOT NULL` |
| `entityId` | UUID | `NOT NULL` |
| `details` | JSONB | |
| `ipAddress` | VARCHAR(45) | |
| `createdAt` | TIMESTAMPTZ | `NOT NULL` , `DEFAULT NOW()` |

---

## Referential Integrity Notes

| Foreign Key | On Delete Behavior | Rationale |
|---|---|---|
| `leave_balances.userId → users.id` | `CASCADE` | Removing a user removes their balance records. |
| `leave_requests.userId → users.id` | `CASCADE` | Removing a user removes their leave requests. |
| `leave_balances.leaveTypeId → leave_types.id` | `RESTRICT` | Prevent deletion of a leave type that still has balance records. |
| `leave_requests.leaveTypeId → leave_types.id` | `RESTRICT` | Prevent deletion of a leave type that still has associated requests. |
| `leave_requests.approverId → users.id` | `SET NULL` | If an approver is removed, their approval history is preserved (approver becomes null). |
| `audit_logs.userId → users.id` | `SET NULL` | Audit trail retained even if the user is later deleted. |

## Indexes

- `idx_leave_requests_userId` on `leave_requests(userId)`
- `idx_leave_requests_status` on `leave_requests(status)`
- `idx_leave_requests_dates` on `leave_requests(startDate, endDate)`
- `idx_leave_balances_userId` on `leave_balances(userId)`
- `idx_audit_logs_entity` on `audit_logs(entity, entityId)`
- `idx_audit_logs_createdAt` on `audit_logs(createdAt)`
