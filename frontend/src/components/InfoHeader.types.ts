import type {ReactNode} from 'react';
import type {IconName} from './Icon';
export type InfoHeaderProps={title:string;eyebrow?:string;description?:string;icon?:IconName;renderIcon?:()=>ReactNode;iconBackground?:boolean;appearance?:'accent'|'lite';density?:'default'|'compact';action?:ReactNode;onIconPress?:()=>void;iconAccessibilityLabel?:string};
