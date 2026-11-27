import { createRequire } from 'node:module';
import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const frontend=createRequire(resolve(root,'frontend/package.json'));
const expected=frontend('react/package.json').version;
const canonical=realpathSync(frontend.resolve('react'));
const expo=createRequire(frontend.resolve('@clerk/expo/package.json'));
const consumers=[['frontend',frontend],['React DOM',createRequire(frontend.resolve('react-dom/package.json'))],['Clerk Expo',expo],['Clerk React',createRequire(expo.resolve('@clerk/react/package.json'))],['React Native Web',createRequire(frontend.resolve('react-native-web/package.json'))],['React Native',createRequire(frontend.resolve('react-native/package.json'))]];
for(const [name,consumer]of consumers){
 if(realpathSync(consumer.resolve('react'))!==canonical)throw new Error(`${name} resolves a second React copy. Reinstall using the root lockfile before starting the app.`);
 if(consumer('react/package.json').version!==expected)throw new Error(`${name} resolves the wrong React version.`);
}
if(frontend('react-dom/package.json').version!==expected)throw new Error('React and React DOM versions must match.');
console.log(`Verified one React ${expected} runtime across the app, renderer, and Clerk.`);
