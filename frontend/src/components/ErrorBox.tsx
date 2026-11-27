import { Icon } from './Icon';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { theme } from '../branding/theme';
import type { ErrorBoxProps } from './ErrorBox.types';
export function ErrorBox({children,onRetry,busy}:ErrorBoxProps){return <View accessibilityRole="alert" style={styles.box}><Icon name="alert-circle-outline" tone="error" size="small"/><View style={styles.content}><Text style={styles.message}>{children}</Text>{onRetry?<Button label="Retry" variant="outline" busy={busy} onPress={onRetry}/>:null}</View></View>;}
const styles=StyleSheet.create({box:{width:'100%',flexDirection:'row',gap:12,padding:16,borderWidth:1,borderColor:theme.error,borderRadius:10,backgroundColor:'#FFF3F2'},icon:{color:theme.error,fontSize:16,fontWeight:'700'},content:{flex:1,gap:12},message:{color:theme.error,fontSize:14,lineHeight:22}});
