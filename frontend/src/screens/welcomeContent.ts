import { brand } from '../branding/identity';

export const welcomeFeatures = [
  ['01', 'Your account', 'Manage your profile and photo.'],
  ['02', 'Workspace access', 'Sign in with your assigned account.'],
  ['03', 'Platform administration', 'Manage access with an administrator account.'],
] as const;

export const welcomeCopy = {
  eyebrow: `WELCOME TO ${brand.name.toUpperCase()}`,
  title: 'Your workspace',
  description: 'Sign in to manage your account and access your workspace.',
  signInTitle: 'Welcome back.',
  signInDescription: 'Sign in to your account.',
  signInButton: `Sign in to ${brand.name}`,
  pendingTitle: 'Sign-in is unavailable',
  pendingDescription: 'Connect an authentication provider to enable account access.',
  footerName: brand.name,
  footerDescription: 'Your account and workspace.',
};
