import { useRef, useState } from 'react';
import { useClerkSignInApi } from './clerkSignInApi.web';

/** Coordinates transient form state through the auth interface, without SDK protocol details. */
export function useSignInModel() {
  const api = useClerkSignInApi();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verification, setVerification] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);

  async function submit() {
    if (submitting.current || !api.isReady()) return;
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      const result = verification ? await api.verify(code) : await api.signIn({ email, password });
      if (result === 'complete') setPassword('');
      else if (result === 'verification-required') { setPassword(''); setVerification(true); }
      else setError('Additional verification is required. Please use account recovery to continue.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in. Please try again.');
    } finally { submitting.current = false; setBusy(false); }
  }
  return {
    email, setEmail, password, setPassword, code, setCode, showPassword,
    togglePassword: () => setShowPassword(value => !value),
    verification, busy, error, submit,
    openRecovery: api.openRecovery, openRegistration: api.openRegistration,
  };
}
