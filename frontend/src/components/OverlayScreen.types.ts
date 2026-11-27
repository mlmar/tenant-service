import type { IconName } from './Icon';
import type { ReactNode } from 'react';
export type OverlayScreenProps={visible:boolean;title:string;onClose:()=>void;children:ReactNode;busy?:boolean;subtitle?:string;icon?:IconName;footer?:ReactNode};
