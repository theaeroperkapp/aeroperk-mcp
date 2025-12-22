import { aeroperkClient } from './aeroperkClient';
import { User } from '@/types';

export async function getUserFromToken(token: string | null): Promise<User | null> {
  if (!token) {
    return null;
  }

  try {
    const userData = await aeroperkClient.verifyToken(token);
    return {
      ...userData,
      access_token: token,
    };
  } catch (error: any) {
    console.error('Token verification failed:', error.response?.data?.message || error.message);
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  // Handle "Bearer {token}" format
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }

  // Return as-is if it's just the token
  return authHeader;
}

export function isValidObjectId(id: string): boolean {
  // MongoDB ObjectId validation (24 hex characters)
  return /^[a-fA-F0-9]{24}$/.test(id);
}
