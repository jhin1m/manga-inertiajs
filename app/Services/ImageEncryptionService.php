<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class ImageEncryptionService
{
    private string $key;
    private string $cipher = 'AES-256-CBC';

    public function __construct()
    {
        $this->key = config('app.image_encryption_key') ?? env('IMAGE_ENCRYPTION_KEY');
        
        if (empty($this->key)) {
            throw new \Exception('IMAGE_ENCRYPTION_KEY is not set in environment variables');
        }
        
        // Ensure key is exactly 32 bytes for AES-256
        $this->key = str_pad($this->key, 32, '0');
        $this->key = substr($this->key, 0, 32);
    }

    /**
     * Encrypt image URL using AES-256-CBC
     */
    public function encrypt(string $url): string
    {
        if (empty($url)) {
            return '';
        }

        try {
            // Generate random IV (16 bytes for AES)
            $iv = random_bytes(16);
            
            // Encrypt the URL
            $encrypted = openssl_encrypt($url, $this->cipher, $this->key, OPENSSL_RAW_DATA, $iv);
            
            if ($encrypted === false) {
                throw new \Exception('Failed to encrypt URL');
            }
            
            // Combine IV and encrypted data, then base64 encode
            $result = base64_encode($iv . $encrypted);
            
            return $result;
        } catch (\Exception $e) {
            Log::error('Image URL encryption failed', [
                'error' => $e->getMessage(),
                'url_length' => strlen($url)
            ]);
            
            // Return original URL if encryption fails to maintain functionality
            return $url;
        }
    }

    /**
     * Decrypt image URL using AES-256-CBC
     */
    public function decrypt(string $encryptedUrl): string
    {
        if (empty($encryptedUrl)) {
            return '';
        }

        try {
            // Decode base64
            $data = base64_decode($encryptedUrl, true);
            
            if ($data === false || strlen($data) < 16) {
                throw new \Exception('Invalid encrypted data format');
            }
            
            // Extract IV (first 16 bytes) and encrypted data
            $iv = substr($data, 0, 16);
            $encrypted = substr($data, 16);
            
            // Decrypt
            $decrypted = openssl_decrypt($encrypted, $this->cipher, $this->key, OPENSSL_RAW_DATA, $iv);
            
            if ($decrypted === false) {
                throw new \Exception('Failed to decrypt URL');
            }
            
            return $decrypted;
        } catch (\Exception $e) {
            Log::error('Image URL decryption failed', [
                'error' => $e->getMessage(),
                'encrypted_url_length' => strlen($encryptedUrl)
            ]);
            
            // Return the encrypted URL as-is if decryption fails
            // This allows for graceful degradation
            return $encryptedUrl;
        }
    }

    /**
     * Check if a string appears to be encrypted (base64 encoded)
     */
    public function isEncrypted(string $url): bool
    {
        if (empty($url)) {
            return false;
        }

        // Basic check for base64 format
        return base64_encode(base64_decode($url, true)) === $url && strlen($url) > 20;
    }

    /**
     * Safely encrypt URL only if it's not already encrypted
     */
    public function safeEncrypt(string $url): string
    {
        if ($this->isEncrypted($url)) {
            return $url;
        }
        
        return $this->encrypt($url);
    }

    /**
     * Safely decrypt URL only if it appears to be encrypted
     */
    public function safeDecrypt(string $url): string
    {
        if (!$this->isEncrypted($url)) {
            return $url;
        }
        
        return $this->decrypt($url);
    }
}