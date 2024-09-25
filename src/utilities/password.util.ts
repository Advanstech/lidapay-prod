import * as bcrypt from 'bcrypt';

export class PasswordUtil {
  static async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new Error(`Error hashing password: ${error.message}`);
    }
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    console.debug('ComparePassword', password);
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error(`Error comparing password: ${error.message}`);
    }
  }
}