import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

const DEFAULT_ROLES = ['user'];
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_BLOCK_MINUTES = 15;

@Injectable()
export class AuthService {
  private loginAttempts = new Map<string, { count: number; blockedUntil: Date }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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
