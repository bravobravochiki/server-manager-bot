# RDP.sh API Client

A comprehensive TypeScript client for the RDP.sh API with built-in rate limiting, error handling, and retry logic.

## Features

- Full TypeScript support with comprehensive type definitions
- Built-in rate limiting (60 requests per minute)
- Automatic retry for failed requests
- Input validation using Zod
- Comprehensive error handling
- Unit tests

## Usage

```typescript
import { RdpApiClient } from './api';

// Initialize the client
const client = new RdpApiClient('your-api-key');

// List all servers
const servers = await client.listServers();

// Get a specific server
const server = await client.getServer('server-id');

// Create a new server
const newServer = await client.createServer({
  plan_id: 1,
  node: 'us-east',
  distro: 'ubuntu-20.04'
});

// Power management
await client.powerAction('server-id', 'start');

// Backup management
const backups = await client.listBackups('server-id');
const newBackup = await client.createBackup('server-id');

// Network usage
const usage = await client.getNetworkUsage(
  'server-id',
  new Date('2024-01-01'),
  new Date('2024-02-01')
);

// List available plans
const plans = await client.listPlans();
```

## Error Handling

The client provides detailed error information through custom error classes:

```typescript
try {
  await client.listServers();
} catch (error) {
  if (error instanceof RdpApiError) {
    console.error(`API Error: ${error.message} (${error.code})`);
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded');
  } else if (error instanceof ValidationError) {
    console.error('Invalid input parameters');
  }
}
```

## Configuration

You can customize the client behavior:

```typescript
const client = new RdpApiClient('your-api-key', {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000
});
```

## Rate Limiting

The client automatically handles rate limiting (60 requests per minute). If you exceed the rate limit, it will throw a `RateLimitError`.