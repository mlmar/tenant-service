import { Text, View } from 'react-native';
import { usePlatformAdmins } from '../auth/usePlatformAdmins';
import { AppScreen, screenStyles } from './AppScreen';
import { ErrorBox } from './ErrorBox';
import { Card, ScreenHeading } from './UI';
export function AdminScreen({ onHome, onProfile }: { onHome: () => void; onProfile: () => void }) {
  const {admins,status,retry}=usePlatformAdmins();
  return <AppScreen showBack onHomePress={onHome} onProfilePress={onProfile}>
    <ScreenHeading title="Administration" eyebrow="PLATFORM" description="Manage platform administrator access." />
    <Card><Text accessibilityRole="header" style={screenStyles.cardTitle}>Platform administrators</Text>
      {status ? status==='Loading administrators…'?<Text accessibilityLiveRegion="polite" style={screenStyles.small}>{status}</Text>:<ErrorBox onRetry={retry}>{status}</ErrorBox> : admins.map(admin => <View key={admin.clerk_user_id}>
        <Text selectable style={screenStyles.description}>{admin.clerk_user_id}</Text>
        <Text style={screenStyles.small}>{admin.role} · {admin.revoked_at ? 'Revoked' : 'Active'}</Text>
      </View>)}
    </Card>
  </AppScreen>;
}
