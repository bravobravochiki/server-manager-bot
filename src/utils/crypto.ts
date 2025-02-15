import crypto from 'crypto';

export function generateEncryptionKey(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('base64');
}

export function validateEncryptionKey(key: string): boolean {
  try {
    // Check if the key is base64 encoded
    const buffer = Buffer.from(key, 'base64');
    
    // Key should be at least 32 bytes (256 bits)
    if (buffer.length < 32) {
      return false;
    }

    // Ensure the key contains enough entropy
    const entropy = calculateEntropy(buffer);
    return entropy > 4; // Minimum bits of entropy per byte
  } catch {
    return false;
  }
}

// Helper function to calculate entropy of a buffer
function calculateEntropy(buffer: Buffer): number {
  const frequencies = new Map<number, number>();
  
  // Count byte frequencies
  for (const byte of buffer) {
    frequencies.set(byte, (frequencies.get(byte) || 0) + 1);
  }
  
  // Calculate entropy using Shannon's formula
  let entropy = 0;
  const length = buffer.length;
  
  for (const count of frequencies.values()) {
    const probability = count / length;
    entropy -= probability * Math.log2(probability);
  }
  
  return entropy;
}