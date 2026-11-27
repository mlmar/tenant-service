import { brand } from '../branding/identity';
import {ActivityIndicator,SafeAreaView,StyleSheet,Text,View}from'react-native';
import{StatusBar}from'expo-status-bar';
import{theme}from'../branding/theme';
import{Brand}from'../branding/Brand';

export function LoadingScreen({onLogoReady}:{onLogoReady:()=>void}){
  return <SafeAreaView style={styles.loading}>
    <StatusBar style="light" />
    <View style={styles.loadingCenter}>
      <Brand stacked onLoadEnd={onLogoReady} />
      <Text style={styles.loadingTagline}>One platform. More possibilities.</Text>
      <View style={styles.loadingStatus} accessibilityRole="progressbar" accessibilityLabel={`Loading ${brand.name}`} accessibilityLiveRegion="polite">
        <ActivityIndicator color={theme.primaryAccent} />
        <Text style={styles.onDarkSmall}>Opening {brand.name}…</Text>
      </View>
    </View>
    <Text style={styles.loadingFooter}>BUILT AROUND YOUR BUSINESS.</Text>
  </SafeAreaView>;
}

const styles=StyleSheet.create({
  loading: { flex: 1, backgroundColor: theme.primaryDark, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingCenter: { width: '100%', alignItems: 'center', maxWidth: 520 },
  loadingTagline: { color: theme.onDark, fontSize: 14, textAlign: 'center', lineHeight: 25, marginTop: 28 },
  loadingStatus: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 36 },
  onDarkSmall: { color: theme.onDark, fontSize: 13, lineHeight: 21 },
  loadingFooter: { color: theme.onDark, fontSize: 9, letterSpacing: 1.8, marginTop: 64, textAlign: 'center' },
});
