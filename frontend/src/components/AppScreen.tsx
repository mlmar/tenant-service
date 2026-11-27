import { Icon } from './Icon';
import type { AppScreenProps } from './AppScreen.types';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAccountIdentity } from '../auth/useAccountIdentity';
import { Avatar } from './UI';
import { Brand } from '../branding/Brand';
import { theme, tokens } from '../branding/theme';

/** Standard signed-in screen: fixed brand header and a warm, scrollable content area. */
export function AppScreen({ children, onProfilePress, onHomePress, showBack = false }: AppScreenProps) {
  const {account,name}=useAccountIdentity();
  return <SafeAreaView style={layout.screen}>
    <StatusBar style="light" />
    <View style={layout.header}><View style={layout.headerContent}><Brand compact onHomePress={onHomePress} />
      {showBack ? <Pressable onPress={onHomePress} accessibilityRole="button" accessibilityLabel="Back to home" style={layout.backButton}><Icon name="arrow-back-outline" tone="onDark"/></Pressable> : null}
      <Pressable onPress={onProfilePress} accessibilityRole="button" style={layout.avatar} accessibilityLabel={`Open profile for ${name}`}>
        <Avatar name={name} imageUrl={account.profile?.avatar_url ?? undefined} />
      </Pressable>
    </View></View>
    <ScrollView style={layout.scroll} contentContainerStyle={layout.scrollContent}>
      <View style={screenStyles.content}>{children}</View>
    </ScrollView>
  </SafeAreaView>;
}
export const screenStyles = StyleSheet.create({
  content: { width: '100%', maxWidth: tokens.layout.contentWidth, alignSelf: 'center', padding: tokens.layout.contentPadding, gap: tokens.layout.rowGap },
  description: { fontSize: tokens.type.bodySize, lineHeight: tokens.type.bodyLine, color: theme.mutedText },
  card: { backgroundColor: theme.mainWhite, borderWidth: 1, borderColor: theme.neutralWhite, borderRadius: tokens.card.radius, padding: tokens.card.padding, gap: tokens.card.gap },
  cardTitle: { fontSize: tokens.type.cardTitleSize, lineHeight: tokens.type.cardTitleLine, fontWeight: '600', color: theme.primaryDark },
  small: { fontSize: tokens.type.smallSize, lineHeight: tokens.type.smallLine, color: theme.mutedText },
});
const layout = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.primaryDark },
  header: { backgroundColor: theme.primaryDark, paddingHorizontal: 20 },
  backButton: { position: 'absolute', right: 44, top: 10, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primaryDark },
  avatar: { position: 'absolute', right: 0, top: 14, width: 36, height: 36, borderRadius: 18, overflow: 'hidden', backgroundColor: theme.lightCard, alignItems: 'center', justifyContent: 'center' },
  headerContent: { width: '100%', maxWidth: 1072, alignSelf: 'center', height: tokens.layout.headerHeight },
  scroll: { flex: 1, backgroundColor: theme.mainBackground },
  scrollContent: { flexGrow: 1, paddingVertical: 8 },
});
