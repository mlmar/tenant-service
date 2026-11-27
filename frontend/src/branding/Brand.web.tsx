import { brand } from './identity';
import { assetUri } from '../lib/assetUri';
import '../styles/Brand.css';
import type{BrandProps}from'./Brand.types';
const mark=assetUri(require('../../assets/icons/logo-mark-transparent.png'));
export function Brand({compact=false,stacked=false,onLoadEnd,onHomePress}:BrandProps){
 if(compact&&!stacked)return <div className="brandStyle-header"><button type="button" className="brandStyle-logoButton" disabled={!onHomePress} onClick={onHomePress} aria-label="Go to home — logo"><img src={mark} alt="" className="brandStyle-headerMark" onLoad={onLoadEnd} onError={onLoadEnd}/></button><div className="brandStyle-center"><button type="button" disabled={!onHomePress} onClick={onHomePress} aria-label={`Go to home — ${brand.name}`} className="brandStyle-wordmarkButton"><span className="brandStyle-headerWordmark">{brand.name}</span></button></div><span className="brandStyle-balance" aria-hidden="true"/></div>;
 return <div className={`brandStyle${stacked?' brandStyle--stacked':''}`} role="img" aria-label={brand.name}><img src={mark} alt="" className="brandStyle-mark" onLoad={onLoadEnd} onError={onLoadEnd}/><div className="brandStyle-wordmarkSlot"><span className="brandStyle-wordmark">{brand.name}</span></div></div>;
}
