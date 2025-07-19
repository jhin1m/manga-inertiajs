import CryptoJS from 'crypto-js';

/**
 * Crypto utility for decrypting image URLs
 * Matches the Laravel ImageEncryptionService configuration:
 * - AES-256-CBC cipher
 * - PKCS5Padding (default in CryptoJS)
 * - 16-character key (padded to 32 bytes)
 */
class ImageCrypto {
    constructor() {
        // This should match the key used in Laravel backend
        // In a real application, you might want to get this from a secure endpoint
        this.key = 'SecretKey1234567'; // 16 characters
        
        // Ensure key is exactly 32 bytes for AES-256 (pad with zeros if needed)
        this.key = this.key.padEnd(32, '0').substring(0, 32);
    }

    /**
     * Decrypt an encrypted image URL
     * @param {string} encryptedUrl - Base64 encoded encrypted URL
     * @returns {string} - Decrypted URL or original string if decryption fails
     */
    decrypt(encryptedUrl) {
        if (!encryptedUrl || typeof encryptedUrl !== 'string') {
            return encryptedUrl || '';
        }

        try {
            // Check if the URL appears to be encrypted (base64 format)
            if (!this.isEncrypted(encryptedUrl)) {
                return encryptedUrl;
            }

            // Decode base64
            const data = CryptoJS.enc.Base64.parse(encryptedUrl);
            
            // Extract IV (first 16 bytes) and encrypted data
            const ivSize = 16; // 128 bits / 8 = 16 bytes
            const iv = CryptoJS.lib.WordArray.create(data.words.slice(0, ivSize / 4));
            const encrypted = CryptoJS.lib.WordArray.create(
                data.words.slice(ivSize / 4), 
                data.sigBytes - ivSize
            );

            // Decrypt using AES-256-CBC
            const decrypted = CryptoJS.AES.decrypt(
                { ciphertext: encrypted }, 
                CryptoJS.enc.Utf8.parse(this.key), 
                {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7 // PKCS7 is equivalent to PKCS5 for AES
                }
            );

            const decryptedUrl = decrypted.toString(CryptoJS.enc.Utf8);
            
            if (!decryptedUrl) {
                throw new Error('Decryption resulted in empty string');
            }

            return decryptedUrl;
        } catch (error) {
            console.warn('Failed to decrypt image URL:', error.message);
            // Return the original encrypted URL for graceful degradation
            return encryptedUrl;
        }
    }

    /**
     * Check if a string appears to be encrypted (base64 encoded)
     * @param {string} url - URL to check
     * @returns {boolean} - True if appears encrypted
     */
    isEncrypted(url) {
        if (!url || typeof url !== 'string' || url.length < 20) {
            return false;
        }

        // Basic base64 format check
        const base64Regex = /^[A-Za-z0-9+/]+=*$/;
        return base64Regex.test(url) && url.length > 20;
    }

    /**
     * Safely decrypt a URL only if it appears to be encrypted
     * @param {string} url - URL to decrypt
     * @returns {string} - Decrypted URL or original URL
     */
    safeDecrypt(url) {
        if (!this.isEncrypted(url)) {
            return url;
        }
        return this.decrypt(url);
    }

    /**
     * Decrypt multiple URLs
     * @param {Array<string>} urls - Array of URLs to decrypt
     * @returns {Array<string>} - Array of decrypted URLs
     */
    decryptUrls(urls) {
        if (!Array.isArray(urls)) {
            return [];
        }

        return urls.map(url => this.safeDecrypt(url));
    }
}

// Create a singleton instance
const imageCrypto = new ImageCrypto();

/**
 * Decrypt an encrypted image URL
 * @param {string} encryptedUrl - Base64 encoded encrypted URL
 * @returns {string} - Decrypted URL
 */
export const decryptImageUrl = (encryptedUrl) => {
    return imageCrypto.decrypt(encryptedUrl);
};

/**
 * Safely decrypt a URL only if it appears to be encrypted
 * @param {string} url - URL to decrypt
 * @returns {string} - Decrypted URL or original URL
 */
export const safeDecryptImageUrl = (url) => {
    return imageCrypto.safeDecrypt(url);
};

/**
 * Decrypt multiple image URLs
 * @param {Array<string>} urls - Array of URLs to decrypt
 * @returns {Array<string>} - Array of decrypted URLs
 */
export const decryptImageUrls = (urls) => {
    return imageCrypto.decryptUrls(urls);
};

/**
 * Check if a URL appears to be encrypted
 * @param {string} url - URL to check
 * @returns {boolean} - True if appears encrypted
 */
export const isImageUrlEncrypted = (url) => {
    return imageCrypto.isEncrypted(url);
};

export default imageCrypto;