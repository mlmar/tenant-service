import { brand } from '../brand.js';
import type { EmailMessage } from './templates.js';
export type EmailConfig={enabled:boolean;token:string;from:string;stream:string;deliveryType:string;replyTo?:string};
export function getEmailConfig(env:NodeJS.ProcessEnv=process.env):EmailConfig{
 return {enabled:env.EMAIL_ENABLED==='true',token:env.POSTMARK_SERVER_TOKEN?.trim()||'',from:env.POSTMARK_FROM_EMAIL?.trim()||'',stream:env.POSTMARK_MESSAGE_STREAM?.trim()||'outbound',deliveryType:env.POSTMARK_DELIVERY_TYPE||'Sandbox',replyTo:env.EMAIL_REPLY_TO?.trim()|| undefined};
}
function address(value:string){if(!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(value)||/[\r\n]/.test(value))throw Error('A valid single email address is required');}
export class EmailDeliveryError extends Error {constructor(public readonly providerCode:number,public readonly httpStatus:number){super(`Postmark rejected email (HTTP ${httpStatus}, code ${providerCode}); delivery was not confirmed.`);}}
export class EmailClient{
 constructor(private readonly config:EmailConfig=getEmailConfig(),private readonly request:typeof fetch=fetch){}
 async send(message:EmailMessage){
  const c=this.config;if(!c.enabled)throw Error('Email delivery is disabled');if(!c.token)throw Error('Postmark server token is missing');address(c.from);address(message.to);
  if(!message.subject.trim()||/[\r\n]/.test(message.subject))throw Error('A single-line email subject is required');
  // No automatic retry: an ambiguous network timeout must not produce duplicate emails.
  const response=await this.request('https://api.postmarkapp.com/email',{method:'POST',signal:AbortSignal.timeout(15000),headers:{'X-Postmark-Server-Token':c.token,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({From:`${brand.name} <${c.from}>`,To:message.to,ReplyTo:c.replyTo,Subject:message.subject,HtmlBody:message.html,TextBody:message.text,MessageStream:c.stream,Tag:'platform-email'})});
  const data=await response.json() as {ErrorCode?:number;MessageID?:string};
  if(!response.ok||data.ErrorCode!==0||!data.MessageID)throw new EmailDeliveryError(data.ErrorCode??-1,response.status);
  return {messageId:data.MessageID,status:'accepted' as const};
 }
 async details(messageId:string){
  if(!/^[a-f0-9-]{36}$/i.test(messageId))throw Error('Invalid message ID');
  const response=await this.request(`https://api.postmarkapp.com/messages/outbound/${messageId}/details`,{signal:AbortSignal.timeout(15000),headers:{'X-Postmark-Server-Token':this.config.token,Accept:'application/json'}});
  if(!response.ok)throw new EmailDeliveryError(-1,response.status);
  return response.json() as Promise<{Status:string;MessageEvents?:{Type:string;ReceivedAt:string;Details?:string}[]}>;
 }
}
