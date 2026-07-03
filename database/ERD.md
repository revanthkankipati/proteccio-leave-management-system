# Entity Relationship Diagram

```mermaid
erDiagram
    users {
        uuid id PK
        varchar email UK
        varchar password
        varchar firstName
        varchar lastName
        enum role "EMPLOYEE | MANAGER"
        varchar department
        varchar designation
        boolean isActive
        timestamptz createdAt
        timestamptz updatedAt
    }

    leave_types {
        uuid id PK
        varchar name
        varchar code UK
        text description
        int defaultDays
        boolean requiresApproval
        boolean isActive
        timestamptz createdAt
        timestamptz updatedAt
    }

    leave_balances {
        uuid id PK
        uuid userId FK
        uuid leaveTypeId FK
        int year
        decimal totalDays
        decimal usedDays
        decimal remainingDays
        timestamptz createdAt
        timestamptz updatedAt
    }

    leave_requests {
        uuid id PK
        uuid userId FK
        uuid leaveTypeId FK
        date startDate
        date endDate
        text reason
        enum status "PENDING | APPROVED | REJECTED | CANCELLED"
        uuid approverId FK "nullable"
        text approverComment
        timestamptz appliedAt
        timestamptz reviewedAt
        timestamptz createdAt
        timestamptz updatedAt
    }

    audit_logs {
        uuid id PK
        uuid userId FK "nullable"
        varchar action
        varchar entity
        uuid entityId
        jsonb details
        varchar ipAddress
        timestamptz createdAt
    }

    %% Relationships
    users ||--o{ leave_balances : "has"
    users ||--o{ leave_requests : "submits"
    users ||--o{ leave_requests : "approves"
    users ||--o{ audit_logs : "performs"

    leave_types ||--o{ leave_balances : "defines"
    leave_types ||--o{ leave_requests : "categorizes"
```

---

## Relationship Summary

| Relationship | Type | Source | Target | Cardinality |
|---|---|---|---|---|
| Has balances | 1-to-Many | `users` | `leave_balances` | A user can have many leave balance records (one per leave type per year). |
| Submits requests | 1-to-Many | `users` | `leave_requests` | A user can submit many leave requests. |
| Approves requests | 1-to-Many | `users` | `leave_requests` | A manager (approver) can review many leave requests. |
| Performs audits | 1-to-Many | `users` | `audit_logs` | A user can have many audit log entries. |
| Defines balances | 1-to-Many | `leave_types` | `leave_balances` | A leave type defines the balance structure for many users. |
| Categorizes requests | 1-to-Many | `leave_types` | `leave_requests` | A leave type classifies many leave requests. |

---

## Key Constraints

- **Composite unique** on `leave_balances`: `(userId, leaveTypeId, year)`
- **Unique code** on `leave_types`: `code`
- **Unique email** on `users`: `email`
- **Check constraint**: `leave_requests.startDate <= leave_requests.endDate`

---

## Referential Actions

```
users.id → leave_balances.userId   : ON DELETE CASCADE
users.id → leave_requests.userId    : ON DELETE CASCADE
users.id → leave_requests.approverId : ON DELETE SET NULL
users.id → audit_logs.userId        : ON DELETE SET NULL

leave_types.id → leave_balances.leaveTypeId  : ON DELETE RESTRICT
leave_types.id → leave_requests.leaveTypeId  : ON DELETE RESTRICT
```
