import type { User } from '@/types/user';
import type { UserCredential } from 'firebase/auth';

export type AuthType = 'EMAIL' | 'APPLE';

export interface AuthProviderInterface {
  signIn(data?: any): Promise<UserCredential>;
}

export interface UserProfileService {
  getUser(userId: string): Promise<User>;
  createUser(userId: string, user: Partial<User>): Promise<void>;
  updateUser(userId: string, data: Partial<User>): Promise<void>;
}
