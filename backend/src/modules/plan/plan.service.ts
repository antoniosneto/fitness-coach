import {
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { PrismaClient } from '.prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GoalsMotorService } from './services/goals-motor.service';
import type { WeeklyPlanResponseDto } from './dto/weekly-plan-response.dto';

@Injectable()
export class PlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly goalsMotor: GoalsMotorService,
  ) {}

  /**
   * POST /api/v1/plans/weekly.
   * Verifica onboarding completo (UserProfile + BodyCompositionGoal); senão 422.
   * Motor de Metas: GCT, déficit, TACO; persiste WeeklyPlan e retorna 201.
   */
  async generateWeeklyPlan(
    userId: string,
    tenantId: string,
  ): Promise<WeeklyPlanResponseDto> {
    const prisma = this.prisma as unknown as PrismaClient;
    const profile = await prisma.userProfile.findFirst({
      where: {
        userId,
        user: { tenantId, deletedAt: null },
        deletedAt: null,
      },
    });
    const goal = await prisma.bodyCompositionGoal.findFirst({
      where: {
        userId,
        user: { tenantId, deletedAt: null },
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!profile || !goal) {
      throw new UnprocessableEntityException(
        'Dados de onboarding incompletos. Conclua perfil e metas antes de gerar o plano.',
      );
    }

    if (profile.weightKg == null || profile.heightCm == null) {
      throw new UnprocessableEntityException(
        'Perfil incompleto. Informe peso e altura.',
      );
    }

    const input = {
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      birthDate: profile.birthDate,
      sex: profile.sex,
      intensity: goal.intensity,
      currentWeightKg: goal.currentWeightKg,
      targetWeightKg: goal.targetWeightKg,
    };

    const dailyTargets = this.goalsMotor.calculateDailyTargets(input);
    const suggestedMeals = await this.goalsMotor.suggestDailyMeals(
      tenantId,
      dailyTargets.targetKcal,
      dailyTargets.targetProteinG,
      10,
    );

    const { startDate, endDate } = this.getCurrentWeekBounds();
    const preference = await prisma.trainingPreference.findUnique({
      where: { userId },
    });
    const machinesOnly = preference?.machinesOnly ?? true;
    const weeklyTraining = this.goalsMotor.buildWeeklyTrainingSchedule(machinesOnly);
    const summary: WeeklyPlanResponseDto['summary'] = {
      daily_targets: {
        kcal: dailyTargets.targetKcal,
        protein_g: dailyTargets.targetProteinG,
        carb_g: dailyTargets.targetCarbG,
        fat_g: dailyTargets.targetFatG,
      },
      suggested_meals: suggestedMeals,
      weekly_training: weeklyTraining,
      machines_only: machinesOnly,
    };

    const plan = await prisma.weeklyPlan.create({
      data: {
        userId,
        tenantId,
        startDate,
        endDate,
        summaryJson: summary as unknown as object,
      },
    });

    return {
      weekly_plan_id: plan.weeklyPlanId,
      start_date: plan.startDate.toISOString().slice(0, 10),
      end_date: plan.endDate.toISOString().slice(0, 10),
      target_kcal_per_day: dailyTargets.targetKcal,
      summary,
    };
  }

  private getCurrentWeekBounds(): { startDate: Date; endDate: Date } {
    const now = new Date();
    const day = now.getDay();
    const diffMon = now.getDate() - day + (day === 0 ? -6 : 1);
    const startDate = new Date(now);
    startDate.setDate(diffMon);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return { startDate, endDate };
  }
}
