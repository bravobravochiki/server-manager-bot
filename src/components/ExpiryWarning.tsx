import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { isExpiringWithinDays } from '../utils/date';
import { differenceInDays } from 'date-fns';

interface ExpiryWarningProps {
  expiryDate: string;
}

export function ExpiryWarning({ expiryDate }: ExpiryWarningProps) {
  if (!isExpiringWithinDays(expiryDate)) {
    return null;
  }

  const daysUntilExpiry = differenceInDays(new Date(expiryDate), new Date());

  return (
    <div className="inline-flex items-center ml-2 text-amber-600" title={`Expires in ${daysUntilExpiry} days`}>
      <AlertTriangle className="w-4 h-4" />
      <span className="ml-1 text-xs font-medium">
        {daysUntilExpiry}d
      </span>
    </div>
  );
}