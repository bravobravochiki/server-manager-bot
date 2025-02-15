import type { Server } from '../types';
import type { SortField, SortDirection } from '../store/preferences';

export function sortServers(
  servers: Server[],
  field: SortField,
  direction: SortDirection
): Server[] {
  if (!Array.isArray(servers)) {
    return [];
  }

  return [...servers].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'name':
        comparison = (a.rdns || a.id).localeCompare(b.rdns || b.id);
        break;
      case 'distro':
        comparison = a.distro.localeCompare(b.distro);
        break;
      case 'expiry_date':
        comparison = new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      default:
        comparison = 0;
    }

    return direction === 'asc' ? comparison : -comparison;
  });
}

export function filterServers(
  servers: Server[],
  filters: {
    distro?: string;
    powerState?: string[];
    expiryDateStart?: string;
    expiryDateEnd?: string;
  }
): Server[] {
  if (!Array.isArray(servers)) {
    return [];
  }

  return servers.filter((server) => {
    // Validate server object
    if (!server || typeof server !== 'object') {
      return false;
    }

    // Distribution filter
    if (filters.distro && server.distro !== filters.distro) {
      return false;
    }

    // Power state filter
    if (
      filters.powerState?.length &&
      !filters.powerState.includes(server.status)
    ) {
      return false;
    }

    // Date range filter
    if (filters.expiryDateStart || filters.expiryDateEnd) {
      const expiryDate = new Date(server.expiry_date).getTime();
      
      if (
        filters.expiryDateStart &&
        expiryDate < new Date(filters.expiryDateStart).getTime()
      ) {
        return false;
      }
      
      if (
        filters.expiryDateEnd &&
        expiryDate > new Date(filters.expiryDateEnd).getTime()
      ) {
        return false;
      }
    }

    return true;
  });
}