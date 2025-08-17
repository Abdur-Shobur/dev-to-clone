import { Injectable } from '@nestjs/common';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number; // 0-4 scale
}

@Injectable()
export class PasswordValidator {
  /**
   * Validate password strength
   */
  public validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // Check minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else {
      score += 1;
    }

    // Check for uppercase letters
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    // Check for lowercase letters
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    // Check for numbers
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    // Check for special characters
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common, please choose a stronger password');
      score = Math.max(0, score - 2);
    }

    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password should not contain repeated characters');
      score = Math.max(0, score - 1);
    }

    // Check for sequential characters
    if (/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|012)/i.test(password)) {
      errors.push('Password should not contain sequential characters');
      score = Math.max(0, score - 1);
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.min(4, score)
    };
  }

  /**
   * Get password strength description
   */
  public getPasswordStrength(score: number): string {
    switch (score) {
      case 0:
      case 1:
        return 'Very Weak';
      case 2:
        return 'Weak';
      case 3:
        return 'Medium';
      case 4:
        return 'Strong';
      default:
        return 'Unknown';
    }
  }

  /**
   * Generate a secure password suggestion
   */
  public generatePasswordSuggestion(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest with random characters
    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}
