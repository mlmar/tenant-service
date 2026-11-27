import {StyleSheet,Text,View} from 'react-native';
import {theme} from '../branding/theme';
export function RoleBadge({role}:{role:'platform_admin'|'user'}){const label=role==='platform_admin'?'Platform admin':'User';return <View style={styles.badge} accessible accessibilityLabel={`Role: ${label}`}><Text style={styles.text}>{label}</Text></View>;}
const styles=StyleSheet.create({badge:{alignSelf:'center',backgroundColor:theme.primaryLight,borderRadius:6,paddingHorizontal:10,paddingVertical:4},text:{color:theme.primaryDark,fontSize:12,lineHeight:18,fontWeight:'600'}});
