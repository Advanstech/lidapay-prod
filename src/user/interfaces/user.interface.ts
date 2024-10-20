import { Schema } from 'mongoose';
import { InvitationLink } from '../schemas/user.schema';

export interface User extends Document {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  roles: string[];
  wallet: Schema.Types.ObjectId; // Reference to Wallet
  lidapayAccount: Schema.Types.ObjectId; // Reference to LidapayAccount
  emailVerified?: boolean;
  phoneVerified?: boolean;
  verificationToken?: string;
  invitationLinks?: InvitationLink[];
  totalPointsEarned?: number;
  points?: number;
  qrCode?: string;
  gravatar?: string;
  phoneNumberVerificationCode?: string; // Add this line
}
