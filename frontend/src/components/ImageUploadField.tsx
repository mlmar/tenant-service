import { ImageCropEditor } from './ImageCropEditor';
import { ImageTextEditor } from './ImageTextEditor';
import { Icon } from './Icon';
import { useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { prepareNativeAvatar } from '../lib/prepareImage';
import * as ImagePicker from 'expo-image-picker';
import { ModalScreen } from './ModalScreen';
import { Avatar } from './UI';
import { Button } from './Button';
import { ErrorBox } from './ErrorBox';
import { theme } from '../branding/theme';
import { type ImageUploadFieldProps } from './ImageUploadField.types';
export function ImageUploadField({name,imageUri,onUpload,onRemove}:ImageUploadFieldProps){
 const[editing,setEditing]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[draft,setDraft]=useState<string|null|undefined>();
 const [tool,setTool]=useState<'crop'|'text'|null>(null);const history=useRef<Array<string|null|undefined>>([]);
 function change(next:string|null){history.current.push(draft);setDraft(next);setTool(null);}
 function undo(){if(history.current.length)setDraft(history.current.pop());setTool(null);}
 const [saving,setSaving]=useState(false);
 const image=draft===null?undefined:draft??imageUri;
 function close(){if(busy)return;setEditing(false);setDraft(undefined);setTool(null);setError('');}
 async function select(){setError('');try{const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();if(!permission.granted){setError('Allow photo access to choose a profile image.');return;}const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:true,aspect:[1,1],quality:0.8,base64:true});if(result.canceled)return;const file=result.assets[0];change(await prepareNativeAvatar(file.uri));}catch{setError('Unable to open your photos. Please try again.');}}
 async function save(){if(busy||draft===undefined)return;setBusy(true);setSaving(true);setError('');try{if(draft)await onUpload(draft);else await onRemove();setMessage(draft?'Profile photo updated.':'Profile photo removed.');setEditing(false);setDraft(undefined);}catch{setError('Unable to save your photo. Please try again.');}finally{setBusy(false);setSaving(false);}}
 const footer=<View style={styles.actions}><View style={styles.action}><Button label={image?'Replace':'Upload photo'} variant="outline" disabled={busy} fullWidth onPress={()=>void select()}/></View><View style={styles.action}><Button label={saving?'Saving':'Save Photo'} busy={saving} disabled={busy||draft===undefined||tool!==null} fullWidth onPress={()=>void save()}/></View></View>;
 return <View style={styles.container}>
 <Pressable accessibilityRole="button" accessibilityLabel="Edit profile photo" disabled={busy} onPress={()=>{setDraft(undefined);setTool(null);history.current=[];setError('');setMessage('');setEditing(true);}} style={styles.preview}><Avatar name={name} imageUrl={imageUri} size="large"/><View style={styles.badge}><Icon name="pencil-outline" size="small"/></View></Pressable>
 <ModalScreen visible={editing} title="Profile photo" icon="person-outline" subtitle="Replace, crop, or remove your profile photo" onClose={close} busy={busy} footer={footer}>
 {tool==='crop'&&image?<ImageCropEditor uri={image} onApply={change} onCancel={()=>setTool(null)} onError={setError}/>:tool==='text'&&image?<ImageTextEditor uri={image} onApply={change} onCancel={()=>setTool(null)} onError={setError}/>:<View style={styles.editorPreview}>{image?<Image source={{uri:image}} resizeMode="contain" style={styles.image}/>:<Avatar name={name} size="large"/>}{saving?<View style={styles.savingOverlay}><ActivityIndicator color={theme.primaryDark}/></View>:null}</View>}
 <View style={styles.toolbar}>
 <Pressable accessibilityRole="button" accessibilityLabel="Undo photo changes" disabled={busy||!history.current.length} onPress={undo} style={[styles.iconButton,(busy||!history.current.length)&&styles.disabled]}><Icon name="arrow-undo-outline"/></Pressable>
 <Pressable accessibilityRole="button" accessibilityLabel="Crop photo" disabled={busy||!image} onPress={()=>setTool('crop')} style={[styles.iconButton,(busy||!image)&&styles.disabled]}><Icon name="crop-outline"/></Pressable>
 <Pressable accessibilityRole="button" accessibilityLabel="Add text to photo" disabled={busy||!image} onPress={()=>setTool('text')} style={[styles.iconButton,(busy||!image)&&styles.disabled]}><Icon name="text-outline"/></Pressable>
 <Pressable accessibilityRole="button" accessibilityLabel="Remove photo" disabled={busy||!image} onPress={()=>change(null)} style={[styles.iconButton,(busy||!image)&&styles.disabled]}><Icon name="trash-outline" tone="error"/></Pressable>
 <Button label="Cancel" variant="outline" disabled={busy} onPress={close}/>
 </View>
 {error?<ErrorBox>{error}</ErrorBox>:null}
 </ModalScreen>
 {message||busy?<Text accessibilityLiveRegion="polite" style={styles.message}>{busy?'Saving photo…':message}</Text>:null}
 </View>;
}
const styles=StyleSheet.create({savingOverlay:{...StyleSheet.absoluteFillObject,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(255,255,255,.58)'},iconButton:{width:44,height:44,alignItems:'center',justifyContent:'center'},disabled:{opacity:.5},container:{width:'100%',alignItems:'center',gap:12},preview:{width:80,height:80},badge:{position:'absolute',bottom:0,right:0,width:32,height:32,borderRadius:16,backgroundColor:theme.mainWhite,borderWidth:1,borderColor:theme.primaryDark,alignItems:'center',justifyContent:'center'},pencil:{fontSize:20,color:theme.primaryDark},message:{fontSize:14,color:theme.mutedText},editorPreview:{height:320,alignItems:'center',justifyContent:'center',backgroundColor:theme.mainWhite,borderRadius:16,borderWidth:1,borderColor:theme.outlineCard.border,overflow:'hidden'},image:{width:'100%',height:'100%'},actions:{flexDirection:'row',gap:12},action:{flex:1},toolbar:{flexDirection:'row',justifyContent:'center',flexWrap:'wrap',gap:8}});
