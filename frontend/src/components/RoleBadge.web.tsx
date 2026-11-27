import '../styles/standard.css';
export function RoleBadge({role}:{role:'platform_admin'|'user'}){return <span className="roleBadgeStyle" aria-label={`Role: ${role==='platform_admin'?'Platform admin':'User'}`}>{role==='platform_admin'?'Platform admin':'User'}</span>;}
