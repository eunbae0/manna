import { auth } from '@/firebase/config';
import { AuthProviderInterface } from '@/api/auth/types';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  OAuthProvider,
  signInWithCredential,
  UserCredential,
} from 'firebase/auth';
import { handleApiError } from '../../errors';

export class AppleAuthProvider implements AuthProviderInterface {
  async signIn(): Promise<UserCredential> {
    try {
      // Apple 로그인 요청
      const appleAuthCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Firebase 인증 정보 생성
      const { identityToken } = appleAuthCredential;
      if (!identityToken) {
        throw new Error('Apple 로그인 실패: 인증 정보가 없습니다');
      }
      
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken: identityToken,
      });

      // Firebase로 로그인
      return await signInWithCredential(auth, credential);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}
