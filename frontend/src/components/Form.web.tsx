import type { ReactNode, InputHTMLAttributes } from 'react';
import { ErrorBox } from './ErrorBox';
import '../styles/standard.css';
export function FormField({ label, children }: { label: string; children: ReactNode }) { return <label className="ui-field">{label}{children}</label>; }
export function TextInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={`ui-input ${className}`} />; }
export function FormError({ children }: { children: ReactNode }) { return <ErrorBox>{children}</ErrorBox>; }
export function FormLinks({ children }: { children: ReactNode }) { return <div className="ui-form-links">{children}</div>; }
