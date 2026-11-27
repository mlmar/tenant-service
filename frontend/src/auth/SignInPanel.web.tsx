import {useSignInModel}from'./useSignInModel.web';
import { FormField, TextInput, FormError, FormLinks } from '../components/Form.web';
import { Button } from '../components/Button';
import '../styles/standard.css';

export function SignInPanel() {
  const {email,setEmail,password,setPassword,code,setCode,showPassword,togglePassword,verification,busy,error,submit,openRecovery,openRegistration}=useSignInModel();

  return <form onSubmit={event => {event.preventDefault();void submit();}} className="ui-form">
    {verification ? <>
      <p className="ui-form-note">Enter the verification code sent to {email}.</p>
      <FormField label="Verification code">
        <TextInput name="code" autoComplete="one-time-code" inputMode="numeric" value={code} onChange={event => setCode(event.target.value)} required />
      </FormField>
    </> : <>
      <FormField label="Email address">
        <TextInput name="identifier" type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required />
      </FormField>
      <FormField label="Password">
        <span className="ui-password">
          <TextInput name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required className="ui-input--password" />
          <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={togglePassword} className="ui-password-toggle">{showPassword ? 'Hide' : 'Show'}</button>
        </span>
      </FormField>
    </>}
    {error && <FormError>{error}</FormError>}
    <Button type="submit" label={verification ? 'Verify and sign in' : 'Sign in'} busy={busy} fullWidth />
    <FormLinks>
      <button type="button" onClick={openRecovery} className="ui-link">Forgot password?</button>
      <button type="button" onClick={openRegistration} className="ui-link">Create account</button>
    </FormLinks>
  </form>;
}
