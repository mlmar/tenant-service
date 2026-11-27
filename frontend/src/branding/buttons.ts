import { tokens } from './theme';
export const buttonMetrics = { ...tokens.button, fontWeight: '600' as const };
export type ButtonVariant = keyof typeof tokens.buttonVariants;
const color=(name:string)=>tokens.colors[name as keyof typeof tokens.colors]??name;
export const buttonVariants = Object.fromEntries(Object.entries(tokens.buttonVariants).map(([name,roles])=>[name,{background:color(roles.background),foreground:color(roles.foreground),border:color(roles.border)}])) as Record<ButtonVariant,{background:string;foreground:string;border:string}>;
