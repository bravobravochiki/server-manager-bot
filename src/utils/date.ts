import { differenceInDays } from 'date-fns';

export function isExpiringWithinDays(expiryDate: string, days: number = 7): boolean {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = differenceInDays(expiry, now);
  return daysUntilExpiry >= 0 && daysUntilExpiry <= days;
}