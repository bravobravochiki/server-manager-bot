import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

const { ENCRYPTION_KEY } = process.env;

if (!ENCRYPTION_KEY) {
  console.error('Error: ENCRYPTION_KEY not found in environment variables');
  process.exit(1);
}

// Test encryption
const testData = 'Hello, World!';
const encrypted = CryptoJS.AES.encrypt(testData, ENCRYPTION_KEY).toString();
const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);

console.log('Test Results:');
console.log('Original:', testData);
console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypted);
console.log('\nEncryption test:', testData === decrypted ? 'PASSED ✅' : 'FAILED ❌');