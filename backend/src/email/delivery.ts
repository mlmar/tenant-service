import{EmailClient as PostmarkEmailClient}from'./client.js';
import{SmtpEmailClient}from'./smtp.js';
import type{EmailMessage}from'./templates.js';
type Sender={send(message:EmailMessage):Promise<{messageId:string;status:'accepted'}>};
// Routing is based on purpose, not recipient count. A one-person group test still uses Postmark.
export class EmailDeliveryClient{
 constructor(private readonly smtp:Sender=new SmtpEmailClient(),private readonly postmark:Sender=new PostmarkEmailClient()){}
 sendOneOff(message:EmailMessage){return this.smtp.send(message);}
 async sendGroup(messages:EmailMessage[]){
  if(!messages.length||messages.length>500)throw Error('Group must contain 1–500 messages');
  const recipients=new Set<string>();for(const message of messages){const key=message.to.toLowerCase();if(!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(message.to)||recipients.has(key))throw Error('Group recipients must be valid and unique');recipients.add(key);}
  // Individual messages keep recipient addresses private. Do not retry the entire group after partial delivery.
  const results=[];for(const message of messages){try{results.push({to:message.to,...await this.postmark.send(message)});}catch{results.push({to:message.to,status:'failed' as const});}}return results;
 }
}
