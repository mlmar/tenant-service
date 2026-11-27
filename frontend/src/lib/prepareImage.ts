import { Image, Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { avatarUploadActions, IMAGE_UPLOAD_QUALITIES, IMAGE_UPLOAD_TARGET_BYTES } from './imageUploadPreprocessing';
export async function prepareImageUri(uri:string){
 const dimensions=await new Promise<{width:number;height:number}>((resolve,reject)=>Image.getSize(uri,(width,height)=>resolve({width,height}),reject));
 const actions=avatarUploadActions(dimensions.width,dimensions.height);
 let best:ImageManipulator.ImageResult|undefined;
 for(const quality of IMAGE_UPLOAD_QUALITIES){
  const result=await ImageManipulator.manipulateAsync(uri,actions,{compress:quality,format:ImageManipulator.SaveFormat.JPEG});
  if(best&&Platform.OS!=='web')await FileSystem.deleteAsync(best.uri,{idempotent:true}).catch(()=>{});
  best=result;
  const size=Platform.OS==='web'?(await(await fetch(result.uri)).blob()).size:(await FileSystem.getInfoAsync(result.uri) as {size:number}).size;
  if(size<=IMAGE_UPLOAD_TARGET_BYTES)break;
 }
 if(!best)throw Error('Could not prepare the selected photo.');
 return best;
}
export async function prepareNativeAvatar(uri:string){const result=await prepareImageUri(uri);try{return 'data:image/jpeg;base64,'+await FileSystem.readAsStringAsync(result.uri,{encoding:FileSystem.EncodingType.Base64});}finally{await FileSystem.deleteAsync(result.uri,{idempotent:true}).catch(()=>{});}}
