import type { ReactNode } from 'react';
import type { CardProps, HeadingProps, AvatarProps } from './UI.types';
import '../styles/standard.css';
export function Card({ children, centered, padding = 'standard', variant = 'standard' }: CardProps) { return <section className={`ui-card${centered ? ' ui-card--centered' : ''}${padding === 'none' ? ' ui-card--flush' : ''}${variant === 'module' ? ' ui-card--module' : ''}`}>{children}</section>; }
export function ScreenHeading({ title, eyebrow, description }: HeadingProps) { return <div className="ui-heading">{eyebrow && <p className="ui-eyebrow">{eyebrow}</p>}<h1 className="ui-title">{title}</h1>{description && <p className="ui-body">{description}</p>}</div>; }
export function Avatar({ name, imageUrl, size = 'small' }: AvatarProps) { return <span className={`ui-avatar ui-avatar--${size}`}>{imageUrl ? <img src={imageUrl} className="ui-avatar-image" alt={`${name} profile photo`} /> : <span>{name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()}</span>}</span>; }
export function ActionGroup({ children }: { children: ReactNode }) { return <div className="ui-actions">{children}</div>; }
