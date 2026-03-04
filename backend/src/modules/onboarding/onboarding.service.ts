import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { UpdateGoalsDto } from './dto/update-goals.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';

/** REQ-GOAL-001: taxa de perda semanal ≤ 1,5% do peso corporal */
const MAX_WEEKLY_LOSS_PERCENT = 1.5;

/**
 * SCN-ONB-BIOTIPO-VISUAL: converte body_fat_visual_id em valor numérico.
 * Aceita número no id (ex: "25") ou chaves conhecidas.
 */
function bodyFatFromVisualId(visualId: string): number | null {
  const n = Number.parseFloat(visualId);
  if (!Number.isNaN(n) && n >= 5 && n <= 60) return n;
  const lower = visualId.toLowerCase();
  const map: Record<string, number> = {
    low: 15,
    medium: 25,
    high: 35,
    biotype_low: 15,
    biotype_medium: 25,
    biotype_high: 35,
  };
  return map[lower] ?? null;
}

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(
    userId: string,
    tenantId: string,
    dto: UpdateProfileDto,
  ): Promise<void> {
    let bodyFatPercentage: number | undefined = dto.body_fat_percentage;
    if (dto.body_fat_visual_id) {
      const fromVisual = bodyFatFromVisualId(dto.body_fat_visual_id);
      if (fromVisual !== null) bodyFatPercentage = fromVisual;
    }

    const profile = await this.prisma.userProfile.findFirst({
      where: {
        userId,
        user: { tenantId, deletedAt: null },
        deletedAt: null,
      },
    });
    if (!profile) {
      throw new NotFoundException('Perfil não encontrado.');
    }

    await this.prisma.userProfile.update({
      where: { userProfileId: profile.userProfileId },
      data: {
        name: dto.name,
        sex: dto.sex,
        birthDate: new Date(dto.birth_date),
        weightKg: dto.weight_kg,
        heightCm: dto.height_cm,
        bodyFatPercentage: bodyFatPercentage ?? undefined,
        bodyFatVisualId: dto.body_fat_visual_id ?? undefined,
      },
    });
  }

  /**
   * REQ-GOAL-001: valida taxa de perda ≤ 1,5% do peso/semana.
   * Retorna 422 se a meta for fisiologicamente insegura.
   */
  async defineGoals(
    userId: string,
    tenantId: string,
    dto: UpdateGoalsDto,
  ): Promise<void> {
    const weightLossKg = dto.current_weight_kg - dto.target_weight_kg;
    if (weightLossKg <= 0) {
      // ganho de peso ou manutenção: aceitar
      await this.createGoal(userId, dto);
      return;
    }

    const weeksTotal = dto.months_to_target * (52 / 12);
    const weeklyLossKg = weightLossKg / weeksTotal;
    const weeklyLossPercent =
      (weeklyLossKg / dto.current_weight_kg) * 100;

    if (weeklyLossPercent > MAX_WEEKLY_LOSS_PERCENT) {
      throw new UnprocessableEntityException(
        `Taxa de perda semanal (${weeklyLossPercent.toFixed(2)}%) excede o limite seguro de ${MAX_WEEKLY_LOSS_PERCENT}% do peso corporal. Ajuste a meta ou o prazo.`,
      );
    }

    await this.createGoal(userId, dto);
  }

  private async createGoal(
    userId: string,
    dto: UpdateGoalsDto,
  ): Promise<void> {
    await this.prisma.bodyCompositionGoal.create({
      data: {
        userId,
        currentWeightKg: dto.current_weight_kg,
        currentBodyFatPercent: dto.current_body_fat_percent,
        targetWeightKg: dto.target_weight_kg,
        targetBodyFatPercent: dto.target_body_fat_percent,
        monthsToTarget: dto.months_to_target,
        intensity: dto.intensity,
      },
    });
  }
}
