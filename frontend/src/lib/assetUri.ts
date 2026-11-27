import { Image, type ImageSourcePropType } from 'react-native';
/** Resolve the bundler's asset representation without coupling web presentation to RN views. */
export function assetUri(source:ImageSourcePropType):string{
 const asset=Image.resolveAssetSource?Image.resolveAssetSource(source):source;
 if(typeof asset==='string')return asset;
 return (asset as {uri:string}).uri;
}
