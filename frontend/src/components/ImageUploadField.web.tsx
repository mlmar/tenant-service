import {Spinner}from'./Spinner';
import { ImageCropEditor } from './ImageCropEditor.web';
import { ImageTextEditor } from './ImageTextEditor.web';
import { Icon } from './Icon';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ModalScreen } from './ModalScreen';
import { Avatar } from './UI';
import { Button } from './Button';
import { FormError } from './Form.web';
import { type ImageUploadFieldProps } from './ImageUploadField.types';
import '../styles/standard.css';
import { prepareAvatar } from '../lib/prepareAvatar.web';
export function ImageUploadField({name,imageUri,onUpload,onRemove}:ImageUploadFieldProps){
 const input=useRef<HTMLInputElement>(null);
 const[editing,setEditing]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const[draft,setDraft]=useState<File|null|undefined>(),[preview,setPreview]=useState<string>();
 useEffect(()=>{if(!draft){setPreview(undefined);return;}const url=URL.createObjectURL(draft);setPreview(url);return()=>URL.revokeObjectURL(url);},[draft]);
 const [tool,setTool]=useState<'crop'|'text'|null>(null);
 const history=useRef<Array<File|null|undefined>>([]);
 function change(next:File|null){history.current.push(draft);setDraft(next);setTool(null);}
 function undo(){if(history.current.length)setDraft(history.current.pop());setTool(null);}
 const [saving,setSaving]=useState(false);
 const image=draft===null?undefined:preview??imageUri;
 function open(){setDraft(undefined);setError('');setMessage('');history.current=[];setTool(null);setEditing(true);}
 function close(){if(busy)return;setEditing(false);setDraft(undefined);setTool(null);setError('');}
 async function select(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];event.target.value='';if(!file||busy)return;setError('');setBusy(true);try{change(await prepareAvatar(file));}catch(cause){setError(cause instanceof Error?cause.message:'Unable to prepare your photo.');}finally{setBusy(false);}}
 async function save(){if(busy||draft===undefined)return;setBusy(true);setSaving(true);setError('');try{if(draft)await onUpload(draft);else await onRemove();setMessage(draft?'Profile photo updated.':'Profile photo removed.');setEditing(false);setDraft(undefined);}catch{setError('Unable to save your photo. Please try again.');}finally{setBusy(false);setSaving(false);}}
 const footer=<div className="ui-photo-actions"><Button label={image?'Replace':'Upload photo'} variant="outline" disabled={busy} fullWidth onPress={()=>input.current?.click()}/><Button label={saving?'Saving':'Save Photo'} busy={saving} disabled={busy||draft===undefined||tool!==null} fullWidth onPress={()=>void save()}/></div>;
 return <div className="ui-image-upload">
 <button type="button" className="ui-avatar-edit" aria-label="Edit profile photo" aria-expanded={editing} disabled={busy} onClick={open}><Avatar name={name} imageUrl={imageUri} size="large"/><span className="ui-avatar-edit-badge" aria-hidden="true"><Icon name="pencil-outline" size="small"/></span></button>
 <input ref={input} type="file" accept="image/*" onChange={event=>void select(event)} className="ui-visually-hidden" aria-label="Choose profile photo" tabIndex={-1} disabled={busy}/>
 <ModalScreen visible={editing} title="Profile photo" icon="person-outline" subtitle="Replace, crop, or edit your profile photo" onClose={close} busy={busy} footer={footer}>
 {tool==='crop'&&image?<ImageCropEditor uri={image} onApply={change} onCancel={()=>setTool(null)} onError={setError}/>:tool==='text'&&image?<ImageTextEditor uri={image} onApply={change} onCancel={()=>setTool(null)} onError={setError}/>:<div className="ui-photo-preview">{image?<img src={image} alt="Profile photo preview" className="ui-photo-preview-image"/>:<Avatar name={name} size="large"/>}{saving?<div className="imageUploadFieldStyle-savingOverlay"><Spinner label="Saving photo"/></div>:null}</div>}
 <div className="ui-photo-toolbar"><button type="button" className="ui-icon-button" aria-label="Undo photo changes" disabled={busy||history.current.length===0} onClick={undo}><Icon name="arrow-undo-outline"/></button><button type="button" className="ui-icon-button" aria-label="Crop photo" disabled={busy||!image} onClick={()=>setTool(tool==='crop'?null:'crop')}><Icon name="crop-outline"/></button><button type="button" className="ui-icon-button" aria-label="Add text to photo" disabled={busy||!image} onClick={()=>setTool(tool==='text'?null:'text')}><Icon name="text-outline"/></button><button type="button" className="ui-icon-button" aria-label="Remove photo" disabled={busy||!image} onClick={()=>change(null)}><Icon name="trash-outline" tone="error"/></button><button type="button" className="ui-link" disabled={busy} onClick={close}>Cancel</button></div>
 {error?<FormError>{error}</FormError>:null}
 </ModalScreen>
 {message||busy?<span className="ui-form-note" role="status">{busy?'Saving photo…':message}</span>:null}
 </div>;
}
