import { Spinner } from './Spinner';
import { Icon } from './Icon';
import '../styles/standard.css';
import type { ButtonProps } from './Button.types';

export function Button({ label, onPress, variant = 'primary', disabled = false, busy = false, fullWidth = false, type = 'button', icon, size = 'default', accessibilityLabel }: ButtonProps) {
  return <button type={type} onClick={onPress} disabled={disabled || busy} aria-busy={busy} aria-label={accessibilityLabel} className={`ui-button ui-button--${variant}${fullWidth ? ' ui-button--full' : ''}${size==='sm'?' ui-button--sm':''}`}>
    {icon ? <Icon name={icon} size="small" tone={variant==='primary'?'onDark':'primary'}/> : null}
    <span className="ui-button-label">{label}{busy ? <span className="ui-button-loading"><Spinner tone={variant==='primary'?'onDark':'primary'}/></span> : null}</span>
  </button>;
}
