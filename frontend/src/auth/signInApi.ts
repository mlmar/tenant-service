export interface Credentials { email: string; password: string }
export type SignInResult = 'complete' | 'verification-required' | 'recovery-required';
export interface SignInApi {
  isReady(): boolean;
  signIn(credentials: Credentials): Promise<SignInResult>;
  verify(code: string): Promise<SignInResult>;
  openRecovery(): void;
  openRegistration(): void;
}
