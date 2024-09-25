import * as QRCode from 'qrcode';
import { DOMAIN_URL } from '../constants';
import { URL } from 'url';

export async function generateQrCode(userId: string): Promise<string> {
  console.log('Generating QR code for user', userId);
  if (!userId) {
    throw new Error('userId is required');
  }
  try {
    const url = new URL(DOMAIN_URL+`/register?ref=${userId}`);
    return await QRCode.toDataURL(url.toString());
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error('Error generating QR code:');
  }
}
