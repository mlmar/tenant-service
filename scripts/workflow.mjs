import { existsSync, copyFileSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const frontend = resolve(root, 'frontend');
const [action = 'help', profile = 'preview', platform = 'all'] = process.argv.slice(2);
const fail = message => { console.error(message); process.exit(1); };
const run = (command, args, cwd = frontend) => {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', env: process.env });
  if (result.error) fail(`${command}: ${result.error.message}`);
  if (result.status !== 0) process.exit(result.status ?? 1);
};
if (action === 'help') {
  console.log(`Tenant Service — make <target>
Development:
  setup / install          Create missing local env files / install locked dependencies
  dev / dev-down           Docker Compose hot reload / stop
  dev-logs                 Follow frontend and API logs
  dev-app / dev-app-down   Combined production-style web/API container / stop
  dev-web / dev-api        Run individual services without Docker
Checks:
  check / typecheck / test / build
Mobile:
  ios-sim-build            Build and launch local iOS simulator app
  ios-sim-fresh            Restart Metro with cleared cache for the dev client
  ios-sim-reload           Relaunch on the booted simulator
EAS:
  eas-login / eas-whoami / eas-init
  eas-check PROFILE=preview
  eas-build PLATFORM=all PROFILE=preview
  ios-build / android-build / android-build-preview
  ios-submit / android-submit / ios-testflight / android-release
  android-check / android-export / android-credentials
OTA:
  ota-env                  Push frontend/.env.prod to EAS production
  ota-all / ota-ios / ota-android MESSAGE="Describe update"
Cloud Run: see docs/RELEASE.md.
Compatibility aliases: eas-build-ios, eas-build-android, eas-update, testflight, app.

Web: http://localhost:8081   API: http://localhost:3000/api/health (Docker)
Combined app: http://localhost:8080
See docs/PROVIDERS.md for service setup.`);
  process.exit(0);
}
if (action === 'setup') {
  for (const folder of ['frontend', 'backend']) {
    const destination = resolve(root, folder, '.env.local');
    if (!existsSync(destination)) { copyFileSync(resolve(root, folder, '.env.example'), destination); console.log(`Created ${folder}/.env.local`); }
    else console.log(`Preserved ${folder}/.env.local`);
  }
  process.exit(0);
}
if (!['development', 'simulator', 'preview', 'production'].includes(profile)) fail('Unknown EAS profile.');
if (!['all', 'ios', 'android'].includes(platform)) fail('PLATFORM must be all, ios, or android.');
const envFile = resolve(frontend, profile === 'production' ? '.env.prod' : profile === 'preview' ? '.env.preview' : '.env.local');
if (existsSync(envFile)) process.loadEnvFile(envFile);
const config = (await import(`${frontend}/app.config.js?workflow=${Date.now()}`)).default;
const app = config.expo ?? config;
const projectId = app.extra?.eas?.projectId;
if (!projectId || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(projectId)) fail('A dedicated EAS project is not configured. Run make eas-login, make eas-init, then set EXPO_PUBLIC_EAS_PROJECT_ID in frontend/.env.local, .env.preview, or .env.prod as appropriate.');
if (app.ios.bundleIdentifier === 'com.example.tenantservice') fail('Set a unique bundleIdentifier in brand.json before using EAS.');
const profiles = JSON.parse(readFileSync(resolve(frontend, 'eas.json'), 'utf8'));
if (!profiles.build[profile]) fail('Missing EAS build profile.');
if (['preview','production'].includes(profile) && action !== 'credentials') {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url || !/^https:\/\//.test(url) || /localhost|127\.0\.0\.1/i.test(url)) fail('Set EXPO_PUBLIC_API_URL to this project’s dedicated HTTPS API before building or publishing.');
}
if (action === 'eas-check') { console.log(`Tenant Service ${profile} local configuration is valid. Provider access is not verified.`); process.exit(0); }
const eas = process.env.EAS || 'eas';
if (action === 'build') run(eas, ['build', '--platform', platform, '--profile', profile]);
else if (action === 'submit') run(eas, ['submit', '--platform', platform, '--profile', profile, '--latest']);
else if (action === 'credentials') run(eas, ['credentials', '--platform', platform]);
else if (action === 'update') {
  if (!process.env.MESSAGE?.trim()) fail('MESSAGE is required. Example: make ota-all MESSAGE="Improve welcome screen"');
  run(eas, ['update', '--channel', profile, '--environment', profile, '--platform', platform, '--message', process.env.MESSAGE]);
} else if (action === 'env-push') {
  if (!existsSync(envFile)) fail('frontend/.env.prod is required.');
  run(eas, ['env:push', 'production', '--path', '.env.prod']);
} else fail(`Unknown action: ${action}`);
