import { Injectable } from '@nestjs/common';
import type { IMailSender, SendMailParams } from '../ports/mail-sender.interface';

/**
 * Stub de envio de e-mail para desenvolvimento (ADR-002).
 * Não envia e-mail real; registra em console (sem logar o token completo).
 */
@Injectable()
export class ConsoleMailSenderService implements IMailSender {
  async send(params: SendMailParams): Promise<void> {
    const hasLink = [params.text, params.html].some(
      (s) => typeof s === 'string' && s.includes('token='),
    );
    console.log(
      `[MailSender] to=${params.to} subject=${params.subject} linkPresent=${hasLink}`,
    );
  }
}
