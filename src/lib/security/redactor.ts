/**
 * PII and Confidential Legal Data Redaction Utility
 * Prevents accidental leakage of Aadhaar, PAN, bank accounts, auth tokens,
 * or raw private document narratives into server logs or analytics.
 */

export class Redactor {
  // 12-digit Aadhaar number pattern (with or without spaces/hyphens)
  private static readonly AADHAAR_REGEX = /\b[2-9]\d{3}[-\s]?\d{4}[-\s]?\d{4}\b/g;

  // 10-character Indian Permanent Account Number (PAN)
  private static readonly PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g;

  // Indian Bank Account numbers (9 to 18 consecutive digits)
  private static readonly BANK_ACCOUNT_REGEX = /\b\d{9,18}\b/g;

  // Email address pattern
  private static readonly EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

  // JWT or Bearer Auth tokens (eyJ...)
  private static readonly TOKEN_REGEX = /\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g;

  /**
   * Masks sensitive identifier numbers and strings from text.
   */
  public static redact(text: string): string {
    if (!text || typeof text !== 'string') return text;

    return text
      .replace(this.TOKEN_REGEX, '[REDACTED_AUTH_TOKEN]')
      .replace(this.AADHAAR_REGEX, 'XXXX-XXXX-[REDACTED_AADHAAR]')
      .replace(this.PAN_REGEX, 'XXXXX[REDACTED_PAN]')
      .replace(this.EMAIL_REGEX, (match) => {
        const [local, domain] = match.split('@');
        return `${local.slice(0, 2)}***@${domain}`;
      })
      .replace(this.BANK_ACCOUNT_REGEX, (match) => {
        // Only redact if it looks like an account number (length between 10 and 18)
        if (match.length >= 10 && match.length <= 18) {
          return `***[REDACTED_ACC_${match.slice(-4)}]`;
        }
        return match;
      });
  }

  /**
   * Hashes or masks a user ID for non-identifiable observability.
   */
  public static maskUserId(userId?: string): string {
    if (!userId) return 'anonymous';
    if (userId.length <= 8) return 'user_***';
    return `${userId.slice(0, 4)}...${userId.slice(-4)}`;
  }
}
