import{test}from'node:test';import assert from'node:assert/strict';
import{ProfileService}from'./service.js';import{ApplicationError}from'../applicationError.js';
import type{ProfileRecord,ProfileRepository,ProfileTransaction,AvatarStorage}from'./ports.js';
const record=():ProfileRecord=>({clerk_user_id:'user_test',name:'Test',email:'test@example.com',platform_role:'user',status:'active',avatar_path:'user_test/old.webp'});
class MemoryProfiles implements ProfileRepository {
 row:ProfileRecord|undefined=record();queue=new Set<string>();
 async transaction<T>(_userId:string,work:(transaction:ProfileTransaction)=>Promise<T>){
  const before=this.row?{...this.row}:undefined,queue=new Set(this.queue);
  try{return await work({
   findUser:async()=>this.row?{...this.row}:undefined,
   insertUser:async identity=>this.row={...record(),...identity,avatar_path:null},
   setAvatar:async path=>{this.row={...this.row!,avatar_path:path};return{...this.row};},
   queueCleanup:async path=>{this.queue.add(path);},pendingCleanup:async()=>[...this.queue],completeCleanup:async path=>{this.queue.delete(path);},
  });}catch(error){this.row=before;this.queue=queue;throw error;}
 }
}
function fixture(){
 const repository=new MemoryProfiles();const objects=new Set(['user_test/old.webp']);let rejectSigning=false,rejectRemove=false,identities=0,deferred=0;
 const storage:AvatarStorage={upload:async path=>{objects.add(path);},remove:async path=>{if(rejectRemove)throw Error('provider unavailable');objects.delete(path);},signedUrl:async path=>{if(rejectSigning)throw Error('sign failed');return'https://signed.example/'+path;}};
 const service=new ProfileService(repository,{getUser:async()=>{identities++;return{name:'New',email:'new@example.com'};}},storage,{prepare:async()=>Buffer.from('normalized')},()=> 'new',()=>{deferred++;});
 return{service,repository,objects,setRejectSigning:(value:boolean)=>{rejectSigning=value;},setRejectRemove:(value:boolean)=>{rejectRemove=value;},identities:()=>identities,deferred:()=>deferred};
}
test('API implementation lazily provisions ordinary profile through identity/repository interfaces',async()=>{const f=fixture();f.repository.row=undefined;const dto=await f.service.getProfile('user_test');assert.equal(dto.name,'New');assert.equal(dto.platform_role,'user');assert.equal(dto.avatar_url,null);await f.service.getProfile('user_test');assert.equal(f.identities(),1);});
test('disabled accounts cannot read or mutate their profile',async()=>{const f=fixture();f.repository.row!.status='disabled';await assert.rejects(f.service.getProfile('user_test'),e=>e instanceof ApplicationError&&e.code==='account_disabled');await assert.rejects(f.service.removeAvatar('user_test'),ApplicationError);assert.deepEqual([...f.objects],['user_test/old.webp']);});
test('avatar update commits the new path and cleans the previous object',async()=>{const f=fixture();const dto=await f.service.updateAvatar('user_test',{bytes:Buffer.from('input'),contentType:'image/png'});assert.equal(f.repository.row!.avatar_path,'user_test/new.webp');assert.ok(dto.avatar_url?.endsWith('/user_test/new.webp'));assert.deepEqual([...f.objects],['user_test/new.webp']);assert.equal(f.repository.queue.size,0);});
test('failure before commit rolls back persistence and compensates the upload',async()=>{const f=fixture();f.setRejectSigning(true);await assert.rejects(f.service.updateAvatar('user_test',{bytes:Buffer.from('input'),contentType:'image/png'}));assert.equal(f.repository.row!.avatar_path,'user_test/old.webp');assert.deepEqual([...f.objects],['user_test/old.webp']);assert.equal(f.repository.queue.size,0);});
test('cleanup failure retains a durable queue entry and does not undo committed profile',async()=>{const f=fixture();f.setRejectRemove(true);await f.service.updateAvatar('user_test',{bytes:Buffer.from('input'),contentType:'image/png'});assert.equal(f.repository.row!.avatar_path,'user_test/new.webp');assert.equal(f.repository.queue.has('user_test/old.webp'),true);assert.ok(f.deferred()>0);f.setRejectRemove(false);await f.service.getProfile('user_test');assert.equal(f.repository.queue.size,0);assert.equal(f.objects.has('user_test/old.webp'),false);});
test('removal persists null, cleans the object and remains idempotent',async()=>{const f=fixture();assert.equal((await f.service.removeAvatar('user_test')).avatar_url,null);assert.equal(f.repository.row!.avatar_path,null);assert.equal(f.objects.size,0);await f.service.removeAvatar('user_test');assert.equal(f.repository.queue.size,0);});
