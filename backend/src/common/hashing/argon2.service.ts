import { Injectable, Logger } from '@nestjs/common';
import * as argon2 from 'argon2';
import { HashingService } from './hashing.service';

@Injectable()
export class Argon2Service implements HashingService {
  private readonly logger = new Logger(Argon2Service.name);

  private readonly options = {
    type: argon2.argon2id, // Use Argon2id for better security
    memoryCost: 2 ** 16, // 64MB memory cost
    timeCost: 3, // 3 iterations
    parallelism: 1, // 1 thread
    hashLength: 32, // 32 bytes hash length
    saltLength: 16, // 16 bytes salt length
  };

  public async hash(data: string | Buffer): Promise<string> {
    try {
      this.logger.debug('Hashing data with Argon2');
      const hashedData = await argon2.hash(data, this.options);
      this.logger.debug('Data hashed successfully');
      return hashedData;
    } catch (error) {
      this.logger.error('Error hashing data with Argon2', error);
      throw new Error('Failed to hash data');
    }
  }

  public async compare(
    data: string | Buffer,
    encrypted: string,
  ): Promise<boolean> {
    try {
      this.logger.debug('Comparing data with Argon2');
      const isValid = await argon2.verify(encrypted, data);
      this.logger.debug(`Data comparison result: ${isValid}`);
      return isValid;
    } catch (error) {
      this.logger.error('Error comparing data with Argon2', error);
      return false;
    }
  }

  /**
   * Generate a secure random salt
   */
  public async generateSalt(): Promise<string> {
    try {
      return await argon2.hash('', {
        type: this.options.type,
        memoryCost: this.options.memoryCost,
        timeCost: this.options.timeCost,
        parallelism: this.options.parallelism,
        hashLength: 0,
      });
    } catch (error) {
      this.logger.error('Error generating salt', error);
      throw new Error('Failed to generate salt');
    }
  }

  /**
   * Hash data with a specific salt
   */
  public async hashWithSalt(
    data: string | Buffer,
    salt: string,
  ): Promise<string> {
    try {
      return await argon2.hash(data, {
        ...this.options,
        salt: Buffer.from(salt, 'hex'),
      });
    } catch (error) {
      this.logger.error('Error hashing data with salt', error);
      throw new Error('Failed to hash data with salt');
    }
  }

  /**
   * Get hash information (for debugging/validation)
   */
  public getHashInfo(hash: string): argon2.Options {
    try {
      return argon2.needsRehash(hash) ? {} : {};
    } catch (error) {
      this.logger.error('Error getting hash info', error);
      throw new Error('Invalid hash format');
    }
  }
}
