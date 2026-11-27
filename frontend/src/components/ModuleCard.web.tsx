import { assetUri } from '../lib/assetUri';
import { Card } from './UI';
import type { ModuleCardProps } from './ModuleCard.types';
import '../styles/standard.css';
import '../styles/ModuleCard.css';
export function ModuleCard({title,description,illustration,onPress,tone='accent'}:ModuleCardProps){
  const src=assetUri(illustration);
  const content = <div className={`moduleCardStyle moduleCardStyle--${tone}`}>
    <div className="moduleCardStyle-art"><img src={src} alt="" className="moduleCardStyle-image" /></div>
    <div className="moduleCardStyle-copy">
      <h2 className="moduleCardStyle-title">{title}</h2>
      <p className="moduleCardStyle-description">{description}</p>
    </div>
  </div>;
  return <Card padding="none" variant="module">{onPress ? <button type="button" className="moduleCardStyle-link" onClick={onPress} aria-label={title}>{content}</button> : content}</Card>;
}
