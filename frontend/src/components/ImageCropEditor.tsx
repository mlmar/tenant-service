import {useEffect,useMemo,useRef,useState} from 'react';
import {Image,PanResponder,Pressable,StyleSheet,View} from 'react-native';
import {cropImageOnNative} from '../lib/imageEditing.native';
import {prepareNativeAvatar} from '../lib/prepareImage';
import {Icon} from './Icon';
import {Button} from './Button';
import {theme} from '../branding/theme';
export function ImageCropEditor({uri,onApply,onCancel,onError}:{uri:string;onApply:(file:string)=>void;onCancel:()=>void;onError:(message:string)=>void}){
 const[size,setSize]=useState({width:1,height:1}),[pan,setPan]=useState({x:0,y:0}),[busy,setBusy]=useState(false);const start=useRef({x:0,y:0});
 useEffect(()=>{Image.getSize(uri,(width,height)=>setSize({width,height}),()=>onError('Unable to load photo for cropping.'));},[uri]);
 const scale=Math.max(240/size.width,240/size.height),w=size.width*scale,h=size.height*scale;
 const styles=useMemo(()=>StyleSheet.create({frame:{width:240,height:240,overflow:'hidden',alignSelf:'center',backgroundColor:theme.mainWhite,borderWidth:2,borderColor:theme.primaryAccent},image:{position:'absolute',width:w,height:h,left:(240-w)/2+pan.x,top:(240-h)/2+pan.y},body:{gap:12},row:{flexDirection:'row',justifyContent:'center',gap:12},hint:{fontSize:14,lineHeight:22,color:theme.mutedText},cropHost:{width:240,alignSelf:'center'},close:{position:'absolute',top:-15,left:105,width:30,height:30,borderRadius:15,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(15,23,42,.78)',borderWidth:1,borderColor:'rgba(255,255,255,.72)'},apply:{position:'absolute',bottom:12,left:72,width:96}}),[w,h,pan]);
 const responder=PanResponder.create({onStartShouldSetPanResponder:()=>true,onMoveShouldSetPanResponder:()=>true,onPanResponderGrant:()=>{start.current=pan;},onPanResponderMove:(_,gesture)=>setPan({x:Math.max(-(w-240)/2,Math.min((w-240)/2,start.current.x+gesture.dx)),y:Math.max(-(h-240)/2,Math.min((h-240)/2,start.current.y+gesture.dy))})});
 async function apply(){setBusy(true);try{const cropped=await cropImageOnNative(uri,{x:0,y:0,width:240,height:240},{x:(240-w)/2+pan.x,y:(240-h)/2+pan.y,width:w,height:h},size);onApply(await prepareNativeAvatar(cropped));}catch{onError('Unable to crop your photo.');}finally{setBusy(false);}}
 return <View style={styles.body}><View style={styles.cropHost}><View style={styles.frame} {...responder.panHandlers}><Image source={{uri}} style={styles.image}/></View><Pressable accessibilityRole="button" accessibilityLabel="Close crop editor" onPress={onCancel} disabled={busy} style={styles.close}><Icon name="close" size="small" tone="onDark"/></Pressable><View style={styles.apply}><Button label={busy?'Applying':'Crop'} icon="checkmark" size="sm" accessibilityLabel="Apply crop to photo 1" fullWidth busy={busy} onPress={()=>void apply()}/></View></View></View>;
}
