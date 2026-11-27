import { brand, colors } from '../brand.js';

// Email-compatible table layout and inline declarations are intentional for mail clients.
export type EmailMessage = {to:string;subject:string;text:string;html:string};
export type TemplateConfig = {appUrl:string;logoUrl?:string;wordmarkUrl?:string;supportEmail?:string};
const BRAND = {
  primary: colors.primary, primaryForeground: colors.onDark,
  bg: colors.canvas, card: colors.surface, border: colors.secondary,
  text: colors.primary, footer: colors.secondary, muted: colors.muted,
  tagline: 'Your account and workspace',
};
function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function absoluteUrl(url: string | undefined, config: TemplateConfig) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')) throw new Error('Email links must use HTTP or HTTPS');
  const base = config.appUrl.replace(/\/+$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

function greeting(name?: string) {
  return `Hi ${name?.trim() || 'there'},`;
}

function baseText(params: {
  greetingLine?: string;
  bodyLines: string[];
  actionLabel?: string;
  actionUrl?: string;
  supportEmail?: string;
  signatureName?: string;
}) {
  const lines = params.greetingLine
    ? [params.greetingLine, '', ...params.bodyLines]
    : [...params.bodyLines];

  if (params.signatureName) {
    lines.push('', 'Best regards,', params.signatureName);
  }

  if (params.actionUrl) {
    lines.push(
      '',
      `${params.actionLabel || `Open ${brand.name}`}: ${params.actionUrl}`,
    );
  }

  lines.push(
    '',
    'Your account and workspace.',
    brand.name,
  );

  if (params.supportEmail) {
    lines.push('', `Need help? Reply to ${params.supportEmail}.`);
  }

  return lines.join('\n');
}

function renderLogo(config: TemplateConfig, options: {
  margin?: string;
  width?: number;
  url?: string;
} = {}) {
  const logoUrl = absoluteUrl(options.url || config.logoUrl, config);
  if (!logoUrl) return '';

  const width = options.width || 220;
  const margin = options.margin || '0 0 14px';
  return `<img src="${escapeHtml(logoUrl)}" width="${width}" alt="${escapeHtml(brand.name)}" style="display:block;width:${width}px;max-width:100%;height:auto;margin:${margin};">`;
}

function renderLayout(params: {
  title: string;
  eyebrow?: string;
  greetingLine?: string;
  bodyHtml: string;
  actionLabel?: string;
  actionUrl?: string;
  config: TemplateConfig;
  compact?: boolean;
  hideHeading?: boolean;
  signatureName?: string;
}) {
  const actionUrl = absoluteUrl(params.actionUrl, params.config);
  const safeTitle = escapeHtml(params.title);
  const safeEyebrow = escapeHtml(params.eyebrow || BRAND.tagline);
  const safeGreeting = params.greetingLine ? escapeHtml(params.greetingLine) : '';
  const supportEmail = params.config.supportEmail;
  const headingSize = params.compact ? 18 : 22;
  const headingLineHeight = params.compact ? 24 : 29;
  const bodySize = params.compact ? 13 : 15;
  const bodyLineHeight = params.compact ? 20 : 22;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.text};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.bg};margin:0;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:24px 24px 18px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="table-layout:fixed;background:${BRAND.primary};border-radius:10px;margin:0 0 20px;"><tr><td width="56" valign="middle" align="center" style="width:56px;padding:14px 0;">${renderLogo(params.config,{width:40,margin:'0 auto'})}</td><td valign="middle" align="center" style="padding:14px 0;">${renderLogo(params.config,{url:params.config.wordmarkUrl,width:230,margin:'0 auto'}) || `<span style="color:#ffffff;font-size:22px;">${escapeHtml(brand.name)}</span>`}</td><td width="56" aria-hidden="true" style="width:56px;">&nbsp;</td></tr></table>
                <table role="presentation" cellspacing="0" cellpadding="0"><tr>
                  <td valign="middle"><div style="font-size:12px;line-height:16px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:${BRAND.primary};">${safeEyebrow}</div>
                  ${params.hideHeading ? '' : `<h1 style="margin:6px 0 0;font-size:${headingSize}px;line-height:${headingLineHeight}px;font-weight:700;color:${BRAND.primary};">${safeTitle}</h1>`}</td>
                </tr></table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 24px;">
                ${safeGreeting ? `<p style="margin:0 0 12px;font-size:${bodySize}px;line-height:${bodyLineHeight}px;color:${BRAND.text};">${safeGreeting}</p>` : ''}
                ${params.bodyHtml}
                ${params.signatureName ? `<p style="margin:18px 0 0;font-size:${bodySize}px;line-height:${bodyLineHeight}px;color:${BRAND.text};">Best regards,<br>${escapeHtml(params.signatureName)}</p>` : ''}
                ${actionUrl ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:22px 0 0;"><tr><td><a href="${escapeHtml(actionUrl)}" style="display:inline-block;background:${BRAND.primary};color:${BRAND.primaryForeground};text-decoration:none;font-size:14px;line-height:18px;font-weight:700;padding:11px 18px;border:1px solid ${BRAND.primary};border-radius:10px;">${escapeHtml(params.actionLabel || `Open ${brand.name}`)}</a></td></tr></table>` : ''}
              </td>
            </tr>
            <tr>
              <td style="padding:12px 24px;background:${BRAND.footer};border-top:1px solid ${BRAND.border};text-align:center;">
                <p style="margin:0;font-size:14px;line-height:20px;font-weight:400;color:${BRAND.primary};">Your account and workspace.</p>
                ${supportEmail ? `<p style="margin:3px 0 0;font-size:12px;line-height:16px;color:${BRAND.muted};">Need help? Reply to <a href="mailto:${escapeHtml(supportEmail)}" style="color:${BRAND.primary};font-weight:600;text-decoration:none;">${escapeHtml(supportEmail)}</a>.</p>` : ''}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function paragraph(value: string) {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:22px;color:${BRAND.text};">${escapeHtml(value)}</p>`;
}


export function renderNotificationEmail(input:{to:string;recipientName?:string;title:string;message:string;actionUrl?:string;actionLabel?:string},config:TemplateConfig):EmailMessage{
 const greetingLine=greeting(input.recipientName);
 const actionUrl=absoluteUrl(input.actionUrl,config);
 return {to:input.to,subject:`${brand.name}: ${input.title}`,text:baseText({greetingLine,bodyLines:[input.message],actionUrl,actionLabel:input.actionLabel,supportEmail:config.supportEmail,signatureName:`The ${brand.name} Team`}),html:renderLayout({title:input.title,greetingLine,bodyHtml:input.message.split('\n').map(paragraph).join(''),actionUrl,actionLabel:input.actionLabel,config,signatureName:`The ${brand.name} Team`})};
}
