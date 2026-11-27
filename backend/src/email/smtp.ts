import { brand } from '../brand.js';
import nodemailer from 'nodemailer';
import type {EmailMessage} from './templates.js';
export type SmtpConfig={enabled:boolean;host:string;port:number;user:string;from:string;tenantId:string;clientId:string;clientSecret:string;replyTo?:string};
export function getSmtpConfig(env:NodeJS.ProcessEnv=process.env):SmtpConfig{return {enabled:env.SMTP_ENABLED==='true',host:'smtp.office365.com',port:587,user:env.SMTP_USER?.trim()||'',from:env.SMTP_FROM?.trim()||env.SMTP_USER?.trim()||'',tenantId:env.MICROSOFT_365_TENANT_ID||'',clientId:env.MICROSOFT_365_CLIENT_ID||'',clientSecret:env.MICROSOFT_365_CLIENT_SECRET||'',replyTo:env.EMAIL_REPLY_TO?.trim()|| undefined};}
export async function smtpAccessToken(config:SmtpConfig,request:typeof fetch=fetch){
 if(!config.enabled)throw Error('SMTP delivery is disabled');
 if(!config.user||!config.from||!config.tenantId||!config.clientId||!config.clientSecret)throw Error('Microsoft 365 SMTP credentials are not configured');
 if(!/^[0-9a-f-]{36}$/i.test(config.tenantId))throw Error('Invalid Microsoft tenant ID');
 const response=await request(`https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:config.clientId,client_secret:config.clientSecret,grant_type:'client_credentials',scope:'https://outlook.office365.com/.default'})});
 if(!response.ok)throw Error(`Microsoft SMTP authorization failed (HTTP ${response.status})`);
 const data=await response.json() as {access_token?:string};if(!data.access_token)throw Error('Microsoft SMTP access token missing');return data.access_token;
}
export class SmtpEmailClient{
 constructor(private readonly config:SmtpConfig=getSmtpConfig(),private readonly request:typeof fetch=fetch){}
 private async transport(){const c=this.config;return nodemailer.createTransport({host:c.host,port:c.port,secure:false,requireTLS:true,tls:{minVersion:'TLSv1.2',rejectUnauthorized:true},connectionTimeout:15000,socketTimeout:30000,auth:{type:'OAuth2',user:c.user,accessToken:await smtpAccessToken(c,this.request)}});}
 async verify(){const transport=await this.transport();try{return await transport.verify();}finally{transport.close();}}
 async send(message:EmailMessage){
  for(const value of [message.to,this.config.from])if(!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(value))throw Error('A valid single email address is required');
  if(!message.subject.trim()||/[\r\n]/.test(message.subject))throw Error('A single-line email subject is required');
  const transport=await this.transport();try{const info=await transport.sendMail({from:{name:brand.name,address:this.config.from},replyTo:this.config.replyTo,to:message.to,subject:message.subject,text:message.text,html:message.html});if(!info.accepted?.length)throw Error('SMTP recipient was not accepted');return {messageId:info.messageId,status:'accepted' as const};}finally{transport.close();}
 }
}
