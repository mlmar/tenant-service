import { brand } from '../branding/identity';
import { AppScreen } from '../components/AppScreen';
import { ModuleCard } from '../components/ModuleCard';
import { ScreenHeading } from '../components/UI';
import { ErrorBox } from '../components/ErrorBox';
export function HomeScreen({platformAdmin,workspaceUnavailable,onHome,onProfile,onAdmin}:{platformAdmin:boolean;workspaceUnavailable:boolean;onHome:()=>void;onProfile:()=>void;onAdmin:()=>void}){
 return <AppScreen onHomePress={onHome} onProfilePress={onProfile}>
  <ScreenHeading eyebrow="YOUR WORKSPACE" title={`Welcome to ${brand.name}.`} description="Manage your account and workspace."/>
  {platformAdmin?<ModuleCard tone="primary" title="Administration" description="Manage platform access." illustration={require('../../assets/illustrations/admin-module.png')} onPress={onAdmin}/>:null}
  {workspaceUnavailable?<ErrorBox>We couldn’t connect to your workspace. Please try again shortly.</ErrorBox>:null}
 </AppScreen>;
}
