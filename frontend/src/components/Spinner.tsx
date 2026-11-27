import {ActivityIndicator} from 'react-native';
import {theme}from'../branding/theme';
export type SpinnerProps={tone?:'primary'|'accent'|'onDark';label?:string};
export function Spinner({tone='primary',label='Loading'}:SpinnerProps){return <ActivityIndicator size="small" color={tone==='accent'?theme.primaryAccent:tone==='onDark'?theme.onDark:theme.primaryDark} accessibilityLabel={label}/>;}
