import { prepareImageUri } from './prepareImage';
export async function prepareAvatar(file:File):Promise<File>{
 if(file.size>100*1024*1024)throw Error('Choose a photo smaller than 100 MB.');
 if(file.type==='image/svg+xml'||(!file.type.startsWith('image/')&&!/\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i.test(file.name)))throw Error('Choose an image file, such as JPG, PNG, or WebP.');
 const uri=URL.createObjectURL(file);
 try{const result=await prepareImageUri(uri);const response=await fetch(result.uri);const blob=await response.blob();if(blob.size>5*1024*1024)throw Error('This photo is still too large after preparation.');return new File([blob],'avatar.jpg',{type:'image/jpeg'});}
 catch(error){if(/heic|heif/i.test(file.name+file.type))throw Error('This browser cannot decode this HEIC photo. Export it as JPG and try again.');throw error;}
 finally{URL.revokeObjectURL(uri);}
}
