import { brand } from '../branding/identity';
import { useProfileScreen } from '../auth/useProfileScreen';
import { StyleSheet, Text, View } from 'react-native';
import { Card, ActionGroup } from './UI';
import { InfoHeader } from './InfoHeader';
import { RoleBadge } from './RoleBadge';
import { ImageUploadField } from './ImageUploadField';
import { ErrorBox } from './ErrorBox';
import { Button } from './Button';
import { AppScreen, screenStyles as styles } from './AppScreen';

export function ProfileScreen({ onBack }: { onBack: () => void }) {
  const {account,email,name,busy,error,signOut}=useProfileScreen();
  return <AppScreen showBack onHomePress={onBack} onProfilePress={() => {}}>
    <View style={profile.container}>
      <InfoHeader title="Profile" description={`Manage your ${brand.name} account.`} icon="person-outline" />
      <Card centered>
        <ImageUploadField name={name} imageUri={account.profile?.avatar_url ?? undefined} onUpload={account.upload} onRemove={account.remove} />
        <View style={profile.identity}>
          <Text accessibilityRole="header" style={styles.cardTitle}>{name}</Text>
          <Text selectable style={[styles.small, profile.email]}>{email}</Text>
          {account.profile?.platform_role ? <RoleBadge role={account.profile.platform_role}/> : null}
        </View>
        {account.error ? <ErrorBox onRetry={account.retry}>{account.error}</ErrorBox> : null}
      </Card>
      <ActionGroup>
        <Button label="Sign out" variant="secondary" busy={busy} fullWidth onPress={() => void signOut()} />
      </ActionGroup>
      {error ? <ErrorBox>{error}</ErrorBox> : null}
    </View>
  </AppScreen>;
}

const profile = StyleSheet.create({
  container: { width: '100%', maxWidth: 480, alignSelf: 'center', gap: 12 },
  identity: { width: '100%', alignItems: 'center', gap: 4 },
  email: { textAlign: 'center' },
});
