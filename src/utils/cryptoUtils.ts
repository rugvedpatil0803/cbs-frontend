const SECRET_KEY = 'my-super-secret-key-123';

// 🔐 Simple encryption (Base64 + key mix)
export const encryptData = (data: string) => {
  return btoa(data + SECRET_KEY);
};

// 🔓 Decryption
export const decryptData = (encrypted: string) => {
  try {
    const decoded = atob(encrypted);
    return decoded.replace(SECRET_KEY, "");
  } catch {
    return null;
  }
};