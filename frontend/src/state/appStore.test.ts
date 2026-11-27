import{test}from'node:test';import assert from'node:assert/strict';
import{createAppStore}from'./createAppStore';import type{ApplicationApi,Profile,Admin,Permissions}from'../api/contracts';
const profile=(id:string,avatar:string|null=null):Profile=>({clerk_user_id:id,name:id,email:`${id}@example.com`,avatar_url:avatar,platform_role:'user'});
function deferred<T>(){let resolve!:(value:T)=>void;const promise=new Promise<T>(done=>{resolve=done;});return{promise,resolve};}
type Operation='profile'|'permissions'|'admins'|'update'|'remove';
type Handler=(operation:Operation)=>Promise<unknown>;
const fakeApi=(handler:Handler):ApplicationApi=>({
 profile:{getProfile:async()=>await handler('profile') as Profile,updateAvatar:async()=>await handler('update') as Profile,removeAvatar:async()=>await handler('remove') as Profile},
 admin:{getPermissions:async()=>await handler('permissions') as Permissions,listAdmins:async()=>await handler('admins') as Admin[]},
});
const factory=(handler:Handler)=>()=>fakeApi(handler);
const ready=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve();};
test('async reads deduplicate, expose immutable snapshots and notify external subscriptions',async()=>{
 let reads=0;const response=deferred<Profile>();const store=createAppStore(factory(async path=>{if(path==='profile'){reads++;return response.promise;}return{platformAdmin:false};}));let notifications=0;const stop=store.subscribe(()=>notifications++);
 store.getState().beginSession('session-a',async()=>'token');const previous=store.getState();const first=store.getState().loadProfile();const second=store.getState().loadProfile();await ready();assert.equal(reads,1);response.resolve(profile('user-a'));await Promise.all([first,second]);assert.equal(previous.profile.data,null);assert.equal(store.getState().profile.data?.clerk_user_id,'user-a');assert.ok(notifications>0);stop();const count=notifications;store.getState().navigate('profile');assert.equal(notifications,count);
});
test('logout clears all private state and ignores a late response even when transport ignores abort',async()=>{
 const pending=deferred<Profile>();const store=createAppStore(factory(async path=>path==='profile'?pending.promise:{platformAdmin:true}));store.getState().beginSession('session-a',async()=>'token');await ready();store.getState().navigate('admin');store.getState().resetSession();pending.resolve(profile('user-a'));await ready();assert.equal(store.getState().scope,null);assert.equal(store.getState().profile.data,null);assert.equal(store.getState().permissions.data,null);assert.equal(store.getState().screen,'home');
});
test('account or organization switch cannot receive stale data from the previous session',async()=>{
 const old=deferred<Profile>();let instance=0;const store=createAppStore(()=>{const id=++instance;return fakeApi(async path=>path==='profile'?id===1?old.promise:profile('user-b'):{platformAdmin:false});});store.getState().beginSession('user-a:org-a',async()=>'old');await ready();store.getState().beginSession('user-b:org-b',async()=>'new');await store.getState().refreshWorkspace();old.resolve(profile('user-a'));await ready();assert.equal(store.getState().profile.data?.clerk_user_id,'user-b');assert.equal(store.getState().scope,'user-b:org-b');
});
test('permission errors are distinct from a valid ordinary-user response and explicitly recover',async()=>{
 let fail=true;const store=createAppStore(factory(async path=>{if(path==='profile')return profile('user-a');if(fail)throw Error('outage');return{platformAdmin:false};}));store.getState().beginSession('session-a',async()=>'token');await store.getState().refreshWorkspace();assert.equal(store.getState().permissions.status,'error');fail=false;await store.getState().loadPermissions();assert.equal(store.getState().permissions.status,'ready');assert.equal(store.getState().permissions.data?.platformAdmin,false);
});
test('avatar mutation updates subscribers and stale reads cannot replace its result',async()=>{
 let stale=false;const pending=deferred<Profile>();const store=createAppStore(factory(async(path)=>path==='permissions'?{platformAdmin:false}:path==='remove'?profile('user-a','new-avatar'):stale?pending.promise:profile('user-a')));store.getState().beginSession('session-a',async()=>'token');await store.getState().refreshWorkspace();stale=true;const read=store.getState().loadProfile();await ready();await store.getState().updateAvatar();pending.resolve(profile('user-a','old-avatar'));await read;assert.equal(store.getState().profile.data?.avatar_url,'new-avatar');
});
test('concurrent avatar mutations are rejected without retrying or sending a second write',async()=>{
 const pending=deferred<Profile>();let writes=0;const store=createAppStore(factory(async(path)=>{if(path==='remove'){writes++;return pending.promise;}return path==='profile'?profile('user-a'):{platformAdmin:false};}));store.getState().beginSession('session-a',async()=>'token');await store.getState().refreshWorkspace();const write=store.getState().updateAvatar();await assert.rejects(store.getState().updateAvatar(),/already in progress/);assert.equal(writes,1);pending.resolve(profile('user-a'));await write;
});
test('late avatar success cannot update another signed-in account',async()=>{
 const write=deferred<Profile>();const store=createAppStore(factory(async(path)=>path==='remove'?write.promise:path==='profile'?profile('current'):{platformAdmin:false}));store.getState().beginSession('first-account',async()=>'token');await store.getState().refreshWorkspace();const saving=store.getState().updateAvatar();store.getState().beginSession('second-account',async()=>'token');await store.getState().refreshWorkspace();write.resolve(profile('previous','old-user-photo'));await saving;assert.equal(store.getState().scope,'second-account');assert.equal(store.getState().profile.data?.avatar_url,null);
});
test('failed mutation preserves the previous profile and allows an explicit later attempt',async()=>{
 let fail=true;const store=createAppStore(factory(async(path)=>{if(path==='remove'){if(fail)throw Error('rejected');return profile('user-a');}return path==='profile'?profile('user-a','existing-photo'):{platformAdmin:false};}));store.getState().beginSession('account',async()=>'token');await store.getState().refreshWorkspace();await assert.rejects(store.getState().updateAvatar(),/rejected/);assert.equal(store.getState().profile.data?.avatar_url,'existing-photo');fail=false;await store.getState().updateAvatar();assert.equal(store.getState().profile.data?.avatar_url,null);
});
test('admin action consumes the typed list interface without transport envelope knowledge',async()=>{
 const admins=[{clerk_user_id:'user-a',role:'platform_admin',granted_at:'2026-10-29',revoked_at:null}];const store=createAppStore(factory(async path=>path==='admins'?admins:path==='profile'?profile('user-a'):{platformAdmin:true}));store.getState().beginSession('session-a',async()=>'token');await store.getState().loadAdmins();assert.deepEqual(store.getState().admins.data,admins);assert.equal(store.getState().admins.status,'ready');
});
