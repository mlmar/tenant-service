import type {SpinnerProps}from'./Spinner';
import '../styles/Spinner.css';
export function Spinner({tone='primary',label='Loading'}:SpinnerProps){return <span className={`spinnerStyle spinnerStyle--${tone}`} role="progressbar" aria-label={label}/>;}
