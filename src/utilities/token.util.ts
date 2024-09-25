import { sign, verify } from 'jsonwebtoken';
import { JWT_SECRET } from '../constants';

const secretKey = process.env.JWT_SECRET || JWT_SECRET;

export class TokenUtil {

  static generateToken(payload: any, expiresIn: string = '1h'): string {
    console.debug(`TokenUtil, generateToken() payload ==> ${JSON.stringify(payload)}`);
    try {
      const token = sign(payload, secretKey, { expiresIn });
      if (!token) {
        throw new Error('Failed to generate token');
      }
      return token;
    } catch (error) {
      console.error(`Error generating token: ${error.message}`);
      throw new Error('Token generation failed');
    }
  }

  static verifyToken(token: string): any {
    console.debug(`TokenUtil, VerifyToken input: ${JSON.stringify(token)}`);
    try {
      return verify(token, JWT_SECRET);
    } catch (error) {
      console.error(`Error verifying token: ${error.message}`);
      throw new Error(`Invalid token: ${error.message}`);
    }
  }

  // Generate a 6-digit code for phone number verification
  static generateVerificationCode(): string {
    const code = Math.floor(100000 + Math.random() * 900000); // Generates a number between 100000 and 999999
    return code.toString().substring(0, 6); // Return only the first 6 digits
  }

}
