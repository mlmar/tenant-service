import { brand } from '../branding/identity';
import { Brand } from '../branding/Brand';
import { Spinner } from '../components/Spinner';
import '../styles/LoadingScreen.css';
export function LoadingScreen({onLogoReady}:{onLogoReady:()=>void}){return <div className="loadingScreenStyle"><div className="loadingScreenStyle-content"><Brand stacked onLoadEnd={onLogoReady}/><p className="loadingScreenStyle-tagline">One platform. More possibilities.</p><div className="loadingScreenStyle-status" role="progressbar" aria-label={`Loading ${brand.name}`} aria-live="polite"><Spinner tone="accent"/><span>Opening {brand.name}…</span></div></div><p className="loadingScreenStyle-footer">BUILT AROUND YOUR BUSINESS.</p></div>;}
