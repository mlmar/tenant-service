import { brand } from '../branding/identity';
import { Platform, SafeAreaView, ScrollView, StatusBar as NativeStatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Brand } from '../branding/Brand';
import { theme, tokens } from '../branding/theme';
import { screenStyles } from '../components/AppScreen';
import { Button } from '../components/Button';
import { ErrorBox } from '../components/ErrorBox';
import { welcomeFeatures, welcomeCopy } from './welcomeContent';
import type { WelcomeScreenProps } from './WelcomeScreen.types';
export function WelcomeScreen({configured,loaded,busy,error,onSignIn,onHome}:WelcomeScreenProps){
  const narrow=useWindowDimensions().width<800;
  return <SafeAreaView style={styles.page}>
    <StatusBar style="light" />
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <View style={[styles.headerInner, narrow && styles.headerInnerNarrow]}>
          <View style={styles.headerBrand}><Brand compact onHomePress={onHome} /></View>
        </View>
      </View>
      <View style={[styles.main, narrow && styles.mainNarrow]}>
        <View style={[styles.intro, narrow && styles.introNarrow]}>
          <Text style={styles.eyebrow}>{welcomeCopy.eyebrow}</Text>
          <Text accessibilityRole="header" style={[styles.title, narrow && styles.titleNarrow]}>{welcomeCopy.title}</Text>
          <Text style={styles.description}>{welcomeCopy.description}</Text>
          <View style={styles.features}>
            {welcomeFeatures.map(([number, title, body]) => <View key={number} style={styles.feature}>
              <Text style={styles.number}>{number}</Text><View style={styles.featureCopy}><Text style={styles.featureTitle}>{title}</Text><Text style={styles.small}>{body}</Text></View>
            </View>)}
          </View>
        </View>
        <View style={[styles.card, narrow && styles.cardNarrow]}>
          <Text accessibilityRole="header" style={styles.cardTitle}>{welcomeCopy.signInTitle}</Text>
          <Text style={styles.cardDescription}>{welcomeCopy.signInDescription}</Text>
          <Button label={welcomeCopy.signInButton} disabled={!configured || !loaded} busy={busy} fullWidth onPress={onSignIn} />
          {error ? <ErrorBox>{error}</ErrorBox> : null}
          {!configured ? <View style={styles.notice}><Text style={styles.noticeTitle}>{welcomeCopy.pendingTitle}</Text><Text style={styles.small}>{welcomeCopy.pendingDescription}</Text></View> : null}
        </View>
      </View>
      <View style={styles.footer}><Text style={styles.small}>{brand.name}</Text><Text style={styles.small}>{welcomeCopy.footerDescription}</Text></View>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.primaryDark, paddingTop: Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0 },
  scroll: { flexGrow: 1, backgroundColor: theme.mainBackground },
  header: { backgroundColor: theme.primaryDark, paddingHorizontal: 24,
  },
  headerInner: { maxWidth: 1120, width: '100%', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 24, height: 64 },
  headerInnerNarrow: { justifyContent: 'flex-start' },
  headerBrand: { width: '100%', height: 64, minWidth: 0 },
  main: { flexGrow: 1, width: '100%', maxWidth: 1120, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 48, paddingHorizontal: 24, paddingVertical: 32 },
  mainNarrow: { flexDirection: 'column-reverse', justifyContent: 'flex-end', flexGrow: 0, gap: 24, paddingHorizontal: 24, paddingVertical: 24 },
  intro: { flex: 1, gap: 24 },
  introNarrow: { width: '100%', flex: undefined },
  eyebrow: { fontSize: 10, letterSpacing: 1.8, fontWeight: '700', color: theme.mutedText },
  title: { fontSize: tokens.type.heroSize, lineHeight: tokens.type.heroLine, letterSpacing: -1, fontWeight: '600', color: theme.primaryDark },
  titleNarrow: { fontSize: tokens.type.heroNarrowSize, lineHeight: tokens.type.heroNarrowLine, letterSpacing: -0.6 },
  description: { fontSize: 16, lineHeight: 25, color: theme.mutedText, maxWidth: 470 },
  features: { marginTop: 10, gap: 24 },
  feature: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  number: { fontSize: 12, fontWeight: '600', color: theme.primaryDark, backgroundColor: theme.lightCard, padding: 12, borderRadius: 10, overflow: 'hidden' },
  featureCopy: { flex: 1, gap: 4 },
  featureTitle: { fontSize: 15, color: theme.primaryDark, fontWeight: '600' },
  small: { ...screenStyles.small },
  card: { ...screenStyles.card, width: 400, maxWidth: '100%' },
  cardNarrow: { width: '100%' },
  cardTitle: { color: theme.primaryDark, fontSize: 24, lineHeight: 31, fontWeight: '600', letterSpacing: -0.5 },
  cardDescription: { ...screenStyles.description },
  notice: { padding: 16, backgroundColor: theme.lightCard, borderRadius: 10, gap: 6 },
  noticeTitle: { fontSize: 13, fontWeight: '600', color: theme.primaryDark },
  footer: { width: '100%', maxWidth: 1120, alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', paddingHorizontal: 32, paddingVertical: 24, borderTopWidth: 1, borderTopColor: theme.neutralWhite },

});
