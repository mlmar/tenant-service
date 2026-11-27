import{readFileSync,writeFileSync}from'node:fs';
const source=new URL('../src/branding/tokens.json',import.meta.url),target=new URL('../src/styles/tokens.css',import.meta.url);const t=JSON.parse(readFileSync(source,'utf8'));
const kebab=value=>value.replace(/[A-Z]/g,letter=>'-'+letter.toLowerCase());
const vars=Object.entries(t.colors).map(([key,value])=>`  --color-${kebab(key)}: ${value};`);
vars.push(`  --font-ui: ${t.fontFamily};`);
for(const group of ['layout','card','button','type'])for(const[key,value]of Object.entries(t[group]))vars.push(`  --${group}-${kebab(key)}: ${value}px;`);
const variants=Object.entries(t.buttonVariants).map(([name,roles])=>`.ui-button--${name} { --button-bg: ${roles.background==='transparent'?'transparent':`var(--color-${kebab(roles.background)})`}; --button-text: var(--color-${kebab(roles.foreground)}); --button-border: var(--color-${kebab(roles.border)}); }`).join('\n');
const output='/* Generated from branding/tokens.json. Run npm run theme; do not edit. */\n:root {\n'+vars.join('\n')+'\n}\n'+variants+'\n';
if(process.argv.includes('--check')){if(readFileSync(target,'utf8')!==output)throw Error('Theme CSS is stale. Run npm run theme.');console.log('Shared native/web theme tokens verified.');}else writeFileSync(target,output);
