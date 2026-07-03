export function calculateDateDiff(startDate: Date, endDate: Date): number {
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function sanitizeUser(user: any) {
  const { password, ...sanitized } = user;
  return sanitized;
}
