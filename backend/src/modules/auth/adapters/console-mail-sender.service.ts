import { Injectable } from '@nestjs/common';
import type { IMailSender, SendMailParams } from '../ports/mail-sender.interface';

/**
 * Stub de envio de e-mail para desenvolvimento (ADR-002).
 * Não envia e-mail real; registra em console.
 * Em dev, exibe o link de reset no terminal para você copiar e testar a tela de redefinir senha.
 */
@Injectable()
export class ConsoleMailSenderService implements IMailSender {
  async send(params: SendMailParams): Promise<void> {
    const text = params.text ?? params.html ?? '';
    const hasLink = typeof text === 'string' && text.includes('token=');
    console.log(
      `[MailSender] to=${params.to} subject=${params.subject} linkPresent=${hasLink}`,
    );
    // Em dev: exibir o link no terminal para copiar e colar na tela "Redefinir senha"
    if (typeof text === 'string') {
      const urls = text.match(/(https?:\/\/[^\s]+)/g);
      const resetLink = urls?.find((u) => u.includes('token='));
      if (resetLink) {
        console.log('[MailSender] (dev) Link para redefinir senha — copie e use no app:', resetLink);
      }
    }
  }
}
