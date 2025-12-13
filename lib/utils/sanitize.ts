/**
 * Input Sanitization Utilities
 *
 * Security-focused utilities for sanitizing user input before
 * storage or display to prevent XSS and injection attacks.
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * Use this when displaying user-provided text in the UI
 */
export function escapeHtml(text: string): string {
  if (!text) return '';

  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return text.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Strips all HTML tags from a string
 * Use this when you need plain text only
 */
export function stripHtml(text: string): string {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '');
}

/**
 * Sanitizes a string for safe use in URLs
 * Removes special characters and replaces spaces with hyphens
 */
export function sanitizeSlug(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Sanitizes a filename to remove potentially dangerous characters
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';

  // Remove path traversal attempts
  let safe = filename.replace(/\.\./g, '');

  // Remove potentially dangerous characters
  safe = safe.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');

  // Limit length
  if (safe.length > 255) {
    const ext = safe.split('.').pop() || '';
    const name = safe.slice(0, 255 - ext.length - 1);
    safe = `${name}.${ext}`;
  }

  return safe;
}

/**
 * Sanitizes user input for database storage
 * Trims whitespace and optionally limits length
 */
export function sanitizeInput(
  text: string,
  options: {
    maxLength?: number;
    trim?: boolean;
    stripHtml?: boolean;
    toLowerCase?: boolean;
  } = {}
): string {
  if (!text) return '';

  const { maxLength, trim = true, stripHtml: shouldStripHtml = true, toLowerCase = false } = options;

  let result = text;

  // Trim whitespace
  if (trim) {
    result = result.trim();
  }

  // Strip HTML tags
  if (shouldStripHtml) {
    result = stripHtml(result);
  }

  // Convert to lowercase
  if (toLowerCase) {
    result = result.toLowerCase();
  }

  // Limit length
  if (maxLength && result.length > maxLength) {
    result = result.slice(0, maxLength);
  }

  return result;
}

/**
 * Validates and sanitizes an email address
 * Returns null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  if (!email) return null;

  const trimmed = email.trim().toLowerCase();

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return null;
  }

  // Additional security: limit length
  if (trimmed.length > 254) {
    return null;
  }

  return trimmed;
}

/**
 * Sanitizes a URL to prevent javascript: and data: attacks
 * Returns null if potentially malicious
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null;

  const trimmed = url.trim();

  // Check for dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = trimmed.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return null;
    }
  }

  // Ensure it's a valid URL
  try {
    const parsed = new URL(trimmed);
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return trimmed;
  } catch {
    // If URL is relative, allow it
    if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
      return trimmed;
    }
    return null;
  }
}

/**
 * Sanitizes a number input, returning a default value if invalid
 */
export function sanitizeNumber(
  value: string | number | undefined,
  options: {
    min?: number;
    max?: number;
    defaultValue?: number;
    integer?: boolean;
  } = {}
): number {
  const { min, max, defaultValue = 0, integer = false } = options;

  let num = typeof value === 'number' ? value : parseFloat(String(value));

  if (isNaN(num)) {
    return defaultValue;
  }

  if (integer) {
    num = Math.floor(num);
  }

  if (min !== undefined && num < min) {
    num = min;
  }

  if (max !== undefined && num > max) {
    num = max;
  }

  return num;
}

/**
 * Sanitizes JSON input to prevent prototype pollution
 */
export function sanitizeJson<T>(json: string, defaultValue: T): T {
  try {
    const parsed = JSON.parse(json);

    // Prevent prototype pollution
    if (typeof parsed === 'object' && parsed !== null) {
      delete parsed.__proto__;
      delete parsed.constructor;
      delete parsed.prototype;
    }

    return parsed as T;
  } catch {
    return defaultValue;
  }
}
