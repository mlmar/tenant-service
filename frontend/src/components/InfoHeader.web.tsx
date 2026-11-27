import{Icon}from'./Icon';
import type{InfoHeaderProps}from'./InfoHeader.types';
import'../styles/InfoHeader.css';
export function InfoHeader({title,eyebrow,description,icon='information-circle-outline',renderIcon,iconBackground=true,appearance='accent',density='default',action,onIconPress,iconAccessibilityLabel}:InfoHeaderProps){
 const art=<span className={`infoHeaderStyle-icon${iconBackground?'':' infoHeaderStyle-icon--plain'}`}>{renderIcon?renderIcon():<Icon name={icon} size="info"/>}</span>;
 return <header className={`infoHeaderStyle infoHeaderStyle--${appearance}${density==='compact'?' infoHeaderStyle--compact':''}`}>
 {onIconPress?<button type="button" className="infoHeaderStyle-iconButton" aria-label={iconAccessibilityLabel??title} onClick={onIconPress}>{art}</button>:art}
 <div className="infoHeaderStyle-copy">{eyebrow?<p className="infoHeaderStyle-eyebrow">{eyebrow}</p>:null}<h1 className="infoHeaderStyle-title">{title}</h1>{description?<p className="infoHeaderStyle-description">{description}</p>:null}</div>
 {action?<div className="infoHeaderStyle-action">{action}</div>:null}
 </header>;
}
