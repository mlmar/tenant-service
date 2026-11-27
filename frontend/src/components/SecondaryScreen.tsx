import type { ReactNode } from 'react';
import { AppScreen } from './AppScreen';
import { ScreenHeading } from './UI';
/** Full-page secondary navigation, separate from modal editing flows. */
export function SecondaryScreen({title,description,onBack,onProfilePress,children}:{title:string;description?:string;onBack:()=>void;onProfilePress:()=>void;children:ReactNode}){
 return <AppScreen showBack onHomePress={onBack} onProfilePress={onProfilePress}><ScreenHeading title={title} description={description}/>{children}</AppScreen>;
}
