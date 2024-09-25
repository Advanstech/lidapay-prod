// gravatar.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import axios, { AxiosError } from 'axios';

@Injectable()
export class GravatarService {
  private readonly GRAVATAR_BASE_URL = 'https://www.gravatar.com/avatar/';
  private readonly DEFAULT_SIZE = 200;

  /**
   * Generates a Gravatar URL for the given email address.
   *
   * @param email The email address to generate the Gravatar URL for.
   * @param size The size of the Gravatar image (default: 200).
   * @returns The generated Gravatar URL.
   */
  generateAvatarUrl(email: string, size: number = this.DEFAULT_SIZE): string {
    if (!email || typeof email !== 'string') {
      throw new Error('Invalid email address');
    }

    if (size <= 0) {
      throw new Error('Invalid size');
    }

    const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
    return `${this.GRAVATAR_BASE_URL}${hash}?s=${size}`;
  }

  /**
   * Fetches the Gravatar image for the given email address.
   *
   * @param email The email address to fetch the Gravatar image for.
   * @param size The size of the Gravatar image (default: 200).
   * @returns A Promise resolving to the base64-encoded Gravatar image or null if an error occurs.
   */
  async fetchAvatar(email: string, size: number = this.DEFAULT_SIZE): Promise<string | null> {
    try {
      const avatarUrl = this.generateAvatarUrl(email, size);
      const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });

      if (response.status === 200) {
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        return `data:image/png;base64,${base64Image}`;
      } else {
        throw new Error(`Failed to fetch Gravatar: ${response.status}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching Gravatar:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      return null;
    }
  }
}