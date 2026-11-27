import { brand } from '../branding/identity';
import { Brand } from '../branding/Brand';
import { Card } from '../components/UI';
import { Button } from '../components/Button';
import { ErrorBox } from '../components/ErrorBox';
import { SignInPanel } from '../auth/SignInPanel';
import { welcomeFeatures, welcomeCopy } from './welcomeContent';
import type { WelcomeScreenProps } from './WelcomeScreen.types';
import '../styles/WelcomeScreen.css';
export function WelcomeScreen({configured,loaded,busy,error,onSignIn,onHome}:WelcomeScreenProps){
 return <div className="welcomeScreenStyle">
  <header className="welcomeScreenStyle-header"><div className="welcomeScreenStyle-headerContent"><Brand compact onHomePress={onHome}/></div></header>
  <main className="welcomeScreenStyle-main">
   <section className="welcomeScreenStyle-intro"><p className="ui-eyebrow">{welcomeCopy.eyebrow}</p><h1 className="welcomeScreenStyle-title">{welcomeCopy.title}</h1><p className="ui-body">{welcomeCopy.description}</p>
    <div className="welcomeScreenStyle-features">{welcomeFeatures.map(([number,title,body])=><div className="welcomeScreenStyle-feature" key={number}><span className="welcomeScreenStyle-number">{number}</span><div><h2 className="welcomeScreenStyle-featureTitle">{title}</h2><p className="ui-small">{body}</p></div></div>)}</div>
   </section>
   <div className="welcomeScreenStyle-signIn"><Card><h2 className="ui-title">{welcomeCopy.signInTitle}</h2><p className="ui-body">{welcomeCopy.signInDescription}</p>{configured?<SignInPanel/>:<Button label={welcomeCopy.signInButton} disabled={!configured||!loaded} busy={busy} fullWidth onPress={onSignIn}/>}{error?<ErrorBox>{error}</ErrorBox>:null}{!configured?<div className="welcomeScreenStyle-notice"><h3 className="ui-card-title">{welcomeCopy.pendingTitle}</h3><p className="ui-small">{welcomeCopy.pendingDescription}</p></div>:null}</Card></div>
  </main>
  <footer className="welcomeScreenStyle-footer"><p className="ui-small">{brand.name}</p><p className="ui-small">{welcomeCopy.footerDescription}</p></footer>
 </div>;
}
