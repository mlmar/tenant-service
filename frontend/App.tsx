import './src/branding/themeStyles';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { theme } from './src/branding/theme';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoadingScreen } from './src/screens/LoadingScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { AppStateBridge } from './src/state/AppStateBridge';
import { useAppStore } from './src/state/useAppStore';
import { AuthProvider, useAppAuth } from './src/auth/AuthProvider';
import { AdminScreen } from './src/components/AdminScreen';
import { ProfileScreen } from './src/components/ProfileScreen';

export default function App() {
  return <AuthProvider><AppStateBridge><AppContent /></AppStateBridge></AuthProvider>;
}

function AppContent() {
  const auth = useAppAuth();
  const screen=useAppStore(state=>state.screen);
  const setScreen=useAppStore(state=>state.navigate);
  const platformAdmin=useAppStore(state=>state.permissions.status!=='error'&&state.permissions.data?.platformAdmin===true);
  const workspaceUnavailable=useAppStore(state=>state.permissions.status==='error');
  const [loading, setLoading] = useState(true);
  const [logoReady, setLogoReady] = useState(false);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    // Also apply in Expo dev; production HTML includes these before first paint.
    const viewport = document.querySelector('meta[name="viewport"]');
    viewport?.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
    let color = document.querySelector('meta[name="theme-color"]');
    if (!color) {
      color = document.createElement('meta');
      color.setAttribute('name', 'theme-color');
      document.head.appendChild(color);
    }
    color.setAttribute('content', theme.primaryDark);
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach(link => link.remove());
    for (const size of [16, 32, 48]) {
      const icon = document.createElement('link');
      icon.rel = 'icon';
      icon.type = 'image/png';
      icon.sizes.value = `${size}x${size}`;
      icon.href = `/favicon-${size}.png?v=g2`;
      document.head.appendChild(icon);
    }
  }, []);

  useEffect(() => {
    if (!loading || !logoReady) return;
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [loading, logoReady]);
  useEffect(() => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator && !__DEV__) {
      void navigator.serviceWorker.register('/sw.js').catch(error => console.warn('Offline shell unavailable', error));
    }
  }, []);

  async function signIn() {
    if (!auth.configured || !auth.loaded || opening) return;
    setError('');
    setOpening(true);
    try {
      await auth.signIn();
    } catch {
      setError('We couldn’t open sign-in. Please try again.');
    } finally { setOpening(false); }
  }

  if (!loading && auth.loaded && auth.signedIn && screen === 'admin') return <AdminScreen onHome={() => setScreen('home')} onProfile={() => setScreen('profile')} />;

  if (!loading && auth.loaded && auth.signedIn && screen === 'profile') return <ProfileScreen onBack={() => setScreen('home')} />;

  if (!loading && auth.loaded && auth.signedIn) return <HomeScreen platformAdmin={platformAdmin} workspaceUnavailable={workspaceUnavailable} onHome={()=>setScreen('home')} onProfile={()=>setScreen('profile')} onAdmin={()=>setScreen('admin')}/>;
  if (loading || !auth.loaded) return <LoadingScreen onLogoReady={()=>setLogoReady(true)}/>;
  return <WelcomeScreen configured={auth.configured} loaded={auth.loaded} busy={opening} error={error} onSignIn={()=>void signIn()} onHome={()=>{setScreen('home');if(Platform.OS==='web')window.location.hash='';}}/>;
}
