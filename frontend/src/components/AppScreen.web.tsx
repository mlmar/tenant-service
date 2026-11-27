import{useAccountIdentity}from'../auth/useAccountIdentity';
import{Brand}from'../branding/Brand';
import{Avatar}from'./UI';
import{Icon}from'./Icon';
import type{AppScreenProps}from'./AppScreen.types';
import '../styles/AppScreen.css';
export function AppScreen({children,onProfilePress,onHomePress,showBack=false}:AppScreenProps){
 const{account,name}=useAccountIdentity();
 return <div className="appScreenStyle"><header className="appScreenStyle-header"><div className="appScreenStyle-headerContent"><Brand compact onHomePress={onHomePress}/>{showBack?<button type="button" onClick={onHomePress} className="appScreenStyle-back" aria-label="Back to home"><Icon name="arrow-back-outline" tone="onDark"/></button>:null}<button type="button" onClick={onProfilePress} className="appScreenStyle-avatar" aria-label={`Open profile for ${name}`}><Avatar name={name} imageUrl={account.profile?.avatar_url??undefined}/></button></div></header><main className="appScreenStyle-scroll"><div className="appScreenStyle-content">{children}</div></main></div>;
}
