import{createProfileController}from'./controller.js';
import{test}from'node:test';import assert from'node:assert/strict';import express,{type RequestHandler}from'express';import type{AddressInfo}from'node:net';import{createProfileRouter}from'./routes.js';import type{ProfileApi}from'./api.js';import{ApplicationError}from'../applicationError.js';
const authenticated:RequestHandler=(_request,response,next)=>{response.locals.principal={userId:'user_test',organizationId:null};next();};
test('thin routes delegate identity/body to API and consistently map results, errors and limits',async()=>{
 const calls:string[]=[];let fail=false;const dto={clerk_user_id:'user_test',name:'Test',email:'test@example.com',platform_role:'user' as const,avatar_url:null};
 const api:ProfileApi={getProfile:async id=>{calls.push('get:'+id);if(fail)throw Error('private provider secret');return dto;},updateAvatar:async(id,input)=>{calls.push('put:'+id);assert.equal(input.contentType,'image/png');assert.equal(input.bytes.toString(),'bytes');throw new ApplicationError('invalid_image','Invalid image');},removeAvatar:async id=>{calls.push('delete:'+id);return dto;}};
 const app=express();app.use('/profile',createProfileRouter(createProfileController(api),authenticated));app.use('/anonymous',createProfileRouter(createProfileController(api),(_request,response)=>{response.status(401).json({error:'Authentication required'});}));
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.on('listening',resolve));const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
 try{
  assert.equal((await fetch(base+'/anonymous')).status,401);assert.equal(calls.length,0);
  const read=await fetch(base+'/profile');assert.equal(read.status,200);assert.deepEqual(await read.json(),dto);
  const invalid=await fetch(base+'/profile/avatar',{method:'PUT',headers:{'Content-Type':'image/png'},body:'bytes'});assert.equal(invalid.status,400);assert.deepEqual(await invalid.json(),{error:'Invalid image'});
  assert.equal((await fetch(base+'/profile/avatar',{method:'DELETE'})).status,200);
  const count=calls.length;assert.equal((await fetch(base+'/profile/avatar',{method:'PUT',headers:{'Content-Type':'image/png'},body:Buffer.alloc(5*1024*1024+1)})).status,413);assert.equal(calls.length,count);
  fail=true;const unavailable=await fetch(base+'/profile');assert.equal(unavailable.status,503);assert.deepEqual(await unavailable.json(),{error:'Profile temporarily unavailable'});
  assert.deepEqual(calls.slice(0,3),['get:user_test','put:user_test','delete:user_test']);
 }finally{await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
});
