import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import type { PrismaClient } from '.prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MAIL_SENDER, type IMailSender } from './ports/mail-sender.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignupDto } from './dto/signup.dto';

const DEFAULT_ROLES = ['user'];
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_BLOCK_MINUTES = 15;
const FORGOT_PASSWORD_MAX_ATTEMPTS = 5;
const RESET_TOKEN_EXPIRY_HOURS = 1;

@Injectable()
export class AuthService {
  private loginAttempts = new Map<string, { count: number; blockedUntil: Date }>();
  private forgotPasswordAttempts = new Map<string, { count: number; blockedUntil: Date }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(MAIL_SENDER) private readonly mailSender: IMailSender,
  ) {}

  async signup(dto: SignupDto): Promise<void> {
    const tenant = await this.getOrCreateDefaultTenant();
    const existing = await this.prisma.user.findFirst({
      where: {
        tenantId: tenant.tenantId,
        email: dto.email.toLowerCase(),
        deletedAt: null,
      },
    });
    if (existing) {
      throw new ConflictException('Email já utilizado.');
    }
    // NFR-SEC-001: parâmetros alvo 200–500 ms em hardware de referência; validar em pipeline/deploy (ver ADR-001).
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 2,
    });
    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.tenantId,
        email: dto.email.toLowerCase(),
        passwordHash,
      },
    });
    await this.prisma.userProfile.create({
      data: {
        userId: user.userId,
        name: dto.name,
        sex: 'other',
        birthDate: new Date('1990-01-01'),
        heightCm: 0,
      },
    });
  }

  async login(dto: LoginDto, ip: string): Promise<{ access_token: string }> {
    const key = `${ip}:${dto.email.toLowerCase()}`;
    const now = new Date();
    const record = this.loginAttempts.get(key);
    if (record && record.blockedUntil > now) {
      throw new HttpException(
        'Muitas tentativas. Tente novamente em 15 minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    if (record && record.blockedUntil <= now) {
      this.loginAttempts.delete(key);
    }

    const tenant = await this.getOrCreateDefaultTenant();
    const user = await this.prisma.user.findFirst({
      where: {
        tenantId: tenant.tenantId,
        email: dto.email.toLowerCase(),
        deletedAt: null,
      },
    });
    if (!user) {
      this.recordFailedAttempt(key);
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      this.recordFailedAttempt(key);
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    this.loginAttempts.delete(key);
    const payload = {
      sub: user.userId,
      tenant_id: tenant.tenantId,
      roles: DEFAULT_ROLES,
    };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }

  private recordFailedAttempt(key: string): void {
    const now = new Date();
    const record = this.loginAttempts.get(key) ?? { count: 0, blockedUntil: now };
    record.count += 1;
    if (record.count >= LOGIN_MAX_ATTEMPTS) {
      record.blockedUntil = new Date(now.getTime() + LOGIN_BLOCK_MINUTES * 60 * 1000);
    }
    this.loginAttempts.set(key, record);
  }

  /**
   * REQ-AUTH-003: Esqueci minha senha. Sempre retorna 200; envia e-mail apenas se o usuário existir.
   * Rate limit: mesmo critério do login (par IP+email, 5 tentativas → 429 por 15 min).
   */
  async forgotPassword(dto: ForgotPasswordDto, ip: string): Promise<void> {
    const key = `forgot:${ip}:${dto.email.toLowerCase()}`;
    const now = new Date();
    const record = this.forgotPasswordAttempts.get(key);
    if (record && record.blockedUntil > now) {
      throw new HttpException(
        'Muitas tentativas. Tente novamente em 15 minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    if (record && record.blockedUntil <= now) {
      this.forgotPasswordAttempts.delete(key);
    }

    const tenant = await this.getOrCreateDefaultTenant();
    const user = await (this.prisma as unknown as PrismaClient).user.findFirst({
      where: {
        tenantId: tenant.tenantId,
        email: dto.email.toLowerCase(),
        deletedAt: null,
      },
    });

    if (!user) {
      this.recordForgotFailedAttempt(key);
      return; // Sempre 200; não revelar se e-mail existe
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(now.getTime() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
    await (this.prisma as unknown as PrismaClient).passwordResetToken.create({
      data: {
        userId: user.userId,
        tenantId: tenant.tenantId,
        token,
        expiresAt,
      },
    });

    const baseUrl = process.env.RESET_PASSWORD_BASE_URL ?? 'https://app.example.com/reset-password';
    const resetLink = `${baseUrl}?token=${token}`;
    try {
      await this.mailSender.send({
        to: dto.email,
        subject: 'Redefinição de senha',
        text: `Acesse o link para redefinir sua senha (válido por ${RESET_TOKEN_EXPIRY_HOURS}h): ${resetLink}`,
        html: `<p>Acesse o <a href="${resetLink}">link</a> para redefinir sua senha (válido por ${RESET_TOKEN_EXPIRY_HOURS}h).</p>`,
      });
    } catch (err) {
      // ADR-002: não revelar falha; apenas logar
      console.error('[AuthService] forgotPassword: falha ao enviar e-mail', err);
    }
    this.recordForgotFailedAttempt(key);
  }

  /**
   * REQ-AUTH-003: Redefinir senha com token recebido por e-mail.
   */
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const prisma = this.prisma as unknown as PrismaClient;
    const record = await prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });
    const now = new Date();
    if (
      !record ||
      record.expiresAt < now ||
      record.usedAt != null
    ) {
      throw new BadRequestException('Link inválido ou expirado.');
    }

    const passwordHash = await argon2.hash(dto.new_password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 2,
    });
    await prisma.$transaction([
      prisma.user.update({
        where: { userId: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { tokenId: record.tokenId },
        data: { usedAt: now },
      }),
    ]);
  }

  private recordForgotFailedAttempt(key: string): void {
    const now = new Date();
    const record = this.forgotPasswordAttempts.get(key) ?? { count: 0, blockedUntil: now };
    record.count += 1;
    if (record.count >= FORGOT_PASSWORD_MAX_ATTEMPTS) {
      record.blockedUntil = new Date(now.getTime() + LOGIN_BLOCK_MINUTES * 60 * 1000);
    }
    this.forgotPasswordAttempts.set(key, record);
  }

  private async getOrCreateDefaultTenant() {
    let tenant = await this.prisma.tenant.findFirst({ where: { name: 'default' } });
    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: { name: 'default' },
      });
    }
    return tenant;
  }
}
