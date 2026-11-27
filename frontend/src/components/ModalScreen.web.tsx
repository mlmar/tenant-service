import { Icon } from './Icon';
import { useEffect, useRef, useState } from 'react';
import type { OverlayScreenProps } from './OverlayScreen.types';
import '../styles/standard.css';
import '../styles/ModalScreen.css';
export function ModalScreen({visible,title,onClose,children,busy=false,drawer=true,subtitle,footer,icon}:OverlayScreenProps & {drawer?:boolean}){
 const ref=useRef<HTMLDialogElement>(null);
 const [closing,setClosing]=useState(false);
 useEffect(()=>{const dialog=ref.current;let timer:ReturnType<typeof setTimeout>|undefined;
 if(visible){setClosing(false);if(!dialog?.open)dialog?.showModal();}
 else if(dialog?.open){setClosing(true);timer=setTimeout(()=>{dialog.close();setClosing(false);},200);}
 return()=>clearTimeout(timer);
 },[visible]);
 return <dialog ref={ref} className={`modalScreenStyle${drawer?' modalScreenStyle--drawer':''}${closing?' modalScreenStyle--closing':''}`} aria-label={title} onCancel={event=>{event.preventDefault();if(!busy)onClose();}} onClick={event=>{if(event.target===event.currentTarget&&!busy){const box=event.currentTarget.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)onClose();}}}>
 {drawer?<div className="modalScreenStyle-handleRow" aria-hidden="true"><span className="modalScreenStyle-handle"/></div>:null}
 <header className="modalScreenStyle-header">{drawer?<span className="modalScreenStyle-icon" aria-hidden="true"><Icon name={icon??'person-outline'} tone="primary"/></span>:null}<div className="modalScreenStyle-heading"><h2 className="modalScreenStyle-title">{title}</h2>{subtitle?<p className="modalScreenStyle-subtitle">{subtitle}</p>:null}</div><button type="button" className="ui-icon-button" aria-label={`Close ${title}`} disabled={busy} onClick={onClose}><Icon name="close-outline"/></button></header>
 <div className="modalScreenStyle-body">{children}</div>
 {footer?<footer className="modalScreenStyle-footer">{footer}</footer>:null}
 </dialog>;
}
