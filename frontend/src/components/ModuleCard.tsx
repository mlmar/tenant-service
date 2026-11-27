import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from './UI';
import { theme } from '../branding/theme';
import type { ModuleCardProps } from './ModuleCard.types';
export function ModuleCard({ title, description, illustration, onPress, tone = 'accent' }: ModuleCardProps) {
  const content = <View style={styles.layout}>
    <View style={[styles.art,tone === 'primary' ? styles.primaryArt : styles.accentArt]}><Image source={illustration} resizeMode="contain" accessible={false} style={styles.illustration} /></View>
    <View style={styles.copy}>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  </View>;
  return <Card padding="none" variant="module">{onPress ? <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={({pressed}) => pressed && styles.pressed}>{content}</Pressable> : content}</Card>;
}
const styles=StyleSheet.create({
  pressed:{opacity:0.8},
  layout:{flexDirection:'row',alignItems:'stretch',minHeight:136},primaryArt:{backgroundColor:theme.primaryLight},accentArt:{backgroundColor:theme.lightCard},
  art:{width:'30%',overflow:'hidden'},illustration:{...StyleSheet.absoluteFillObject,width:'100%',height:'100%'},copy:{flex:1,gap:6,padding:20,justifyContent:'center'},
  title:{fontSize:18,lineHeight:26,fontWeight:'600',color:theme.primaryDark},
  description:{fontSize:14,lineHeight:22,color:theme.mutedText},
});
