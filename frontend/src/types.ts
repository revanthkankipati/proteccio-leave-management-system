export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'EMPLOYEE' | 'MANAGER';
  department: string | null;
  position: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approverId: string | null;
  comments: string | null;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'department'>;
  leaveType: Pick<LeaveType, 'name' | 'code'>;
  approver?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> | null;
}

export interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
