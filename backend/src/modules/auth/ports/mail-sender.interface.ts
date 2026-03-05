/**
 * Abstração do provedor de e-mail (ADR-002).
 * Implementação stub em dev; em produção injetar provedor real (SES, SendGrid, etc.).
 */
export interface SendMailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const MAIL_SENDER = Symbol('MAIL_SENDER');

export interface IMailSender {
  send(params: SendMailParams): Promise<void>;
}
