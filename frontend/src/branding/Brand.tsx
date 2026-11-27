import { brand } from './identity';
import { tokens } from './theme';
import type { BrandProps } from './Brand.types';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export function Brand({ compact = false, stacked = false, onLoadEnd, onHomePress }: BrandProps) {
  if (compact && !stacked) return <View style={styles.headerLockup}>
    <Pressable disabled={!onHomePress} onPress={onHomePress} accessibilityRole="button" accessibilityLabel="Go to home — logo" style={styles.headerLogoButton}>
      <Image source={require('../../assets/icons/logo-mark-transparent.png')} resizeMode="contain" accessible={false} onLoadEnd={onLoadEnd} style={styles.headerMark} />
    </Pressable>
    <View style={styles.centerWordmark}>
      <Pressable disabled={!onHomePress} onPress={onHomePress} accessibilityRole="button" accessibilityLabel={`Go to home — ${brand.name}`} style={styles.wordmarkButton}>
        <Text numberOfLines={1} style={styles.headerWordmark}>{brand.name}</Text>
      </Pressable>
    </View>
    <View style={styles.headerBalance} />
  </View>;
  return <View style={[styles.container, stacked && styles.stacked, compact && styles.compact]} accessible accessibilityLabel={brand.name}>
    <Image source={require('../../assets/icons/logo-mark-transparent.png')} resizeMode="contain" accessible={false} onLoadEnd={onLoadEnd}
      style={[styles.mark, compact && styles.compactMark]} />
    <View style={[styles.wordmarkSlot, compact && styles.compactWordmarkSlot, stacked && styles.stackedWordmarkSlot]}>
      <Text numberOfLines={1} style={styles.wordmark}>{brand.name}</Text>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  headerLockup: { width: '100%', height: 64, flexDirection: 'row', alignItems: 'center' },
  headerLogoButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  wordmarkButton: { width: '100%', maxWidth: 200, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerMark: { width: 36, height: 36 },
  centerWordmark: { flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 8 },
  headerWordmark: { color: tokens.colors.onDark, fontSize: tokens.type.smallSize, fontWeight: '700' },
  headerBalance: { width: 44 },
  container: { width: '100%', maxWidth: 480, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  stacked: { flexDirection: 'column' },
  compact: { maxWidth: 320, height: 64, gap: 12 },
  mark: { width: 104, height: 104 },
  compactMark: { width: 44, height: 44 },
  wordmark: { color: tokens.colors.onDark, fontSize: tokens.type.titleSize, textAlign: 'center', fontWeight: '700' },
  wordmarkSlot: { flex: 1, minWidth: 0, height: 50 },
  compactWordmarkSlot: { height: 40 },
  stackedWordmarkSlot: { flex: undefined, width: '100%', maxWidth: 240, height: 40 },
});
