import sanitizeHtml from 'sanitize-html';
import xss from 'xss';

export function sanitizeInput(input: string): string {
  // Remove any HTML tags
  const sanitized = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Prevent XSS attacks
  return xss(sanitized);
}

export function validateInput(input: string, pattern: RegExp): boolean {
  return pattern.test(input);
}

export function obfuscateApiKey(apiKey: string): string {
  if (!apiKey) return '';
  const length = apiKey.length;
  const visibleChars = 4;
  return `${apiKey.slice(0, visibleChars)}${'*'.repeat(length - visibleChars * 2)}${apiKey.slice(-visibleChars)}`;
}

export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' https: data:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.rdp.sh",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};