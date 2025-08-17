import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class HashingService {
  /**
   * Hash a string or buffer
   */
  abstract hash(data: string | Buffer): Promise<string>;
  
  /**
   * Compare a string or buffer with a hash
   */
  abstract compare(data: string | Buffer, encrypted: string): Promise<boolean>;
  
  /**
   * Generate a secure random salt
   */
  abstract generateSalt(): Promise<string>;
  
  /**
   * Hash data with a specific salt
   */
  abstract hashWithSalt(data: string | Buffer, salt: string): Promise<string>;
  
  /**
   * Get hash information for debugging/validation
   */
  abstract getHashInfo(hash: string): any;
}
