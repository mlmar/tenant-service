import { Icon } from './Icon';
import { Button } from './Button';
import type { ErrorBoxProps } from './ErrorBox.types';
import '../styles/standard.css';
export function ErrorBox({children,onRetry,busy}:ErrorBoxProps){return <div role="alert" className="ui-error-box"><span className="ui-error-box-icon" aria-hidden="true"><Icon name="alert-circle-outline" tone="error" size="small"/></span><div className="ui-error-box-content"><p className="ui-error-box-message">{children}</p>{onRetry?<Button label="Retry" variant="outline" busy={busy} onPress={onRetry}/>:null}</div></div>;}
