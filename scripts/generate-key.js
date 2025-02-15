import crypto from 'crypto';

// Generate a 256-bit (32-byte) random key
const key = crypto.randomBytes(32).toString('base64');

console.log('Generated Encryption Key:');
console.log(key);
console.log('\nAdd this to your .env file as:');
console.log(`ENCRYPTION_KEY=${key}`);