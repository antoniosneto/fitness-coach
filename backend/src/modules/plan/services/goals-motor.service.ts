import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/** REQ-GOAL-002: déficit 20% para intensidade medium. PRD Suposição 2. */
const DEFICIT_PERCENT: Record<string, number> = {
  light: 0.1,
  medium: 0.2,
  high: 0.3,
};

/** Fórmula Mifflin-St Jeor (PRD seção 7). Peso kg, altura cm, idade anos. */
function mifflinStJeorBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sex: string,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return sex === 'male' ? base + 5 : base - 161;
}

/** GCT = BMR * fator de atividade (sedentário/leve). */
function gctFromBMR(bmr: number, activityFactor: number = 1.375): number {
  return Math.round(bmr * activityFactor);
}

export interface ProfileGoalInput {
  weightKg: number;
  heightCm: number;
  birthDate: Date;
  sex: string;
  intensity: string;
  currentWeightKg: number;
  targetWeightKg: number;
}

export interface DailyTargets {
  targetKcal: number;
  targetProteinG: number;
  targetCarbG: number;
  targetFatG: number;
}

export interface MealSuggestion {
  food_id: string;
  description: string;
  kcal: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
}

@Injectable()
export class GoalsMotorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * REQ-GOAL-002: GCT por Mifflin-St Jeor; aplica déficit por intensidade.
   * Retorna calorias e macros alvo por dia (proteína priorizada ~1.6g/kg massa magra aproximada).
   */
  calculateDailyTargets(input: ProfileGoalInput): DailyTargets {
    const ageYears = this.getAgeYears(input.birthDate);
    const bmr = mifflinStJeorBMR(
      input.weightKg,
      input.heightCm,
      ageYears,
      input.sex,
    );
    const gct = gctFromBMR(bmr);
    const deficit = DEFICIT_PERCENT[input.intensity] ?? DEFICIT_PERCENT.medium;
    const targetKcal = Math.round(gct * (1 - deficit));

    // Macros: proteína ~1.6g/kg peso atual (foco preservação massa magra), resto dividido
    const proteinG = Math.round(input.currentWeightKg * 1.6);
    const proteinKcal = proteinG * 4;
    const remainingKcal = Math.max(0, targetKcal - proteinKcal);
    const fatG = Math.round((remainingKcal * 0.3) / 9);
    const carbG = Math.round((remainingKcal - fatG * 9) / 4);

    return {
      targetKcal,
      targetProteinG: Math.max(proteinG, 50),
      targetCarbG: Math.max(carbG, 0),
      targetFatG: Math.max(fatG, 0),
    };
  }

  /**
   * REQ-GOAL-003: consulta TACO (Food) para montar sugestão de refeição diária
   * com foco em proteína, no tenant.
   */
  async suggestDailyMeals(
    tenantId: string,
    targetKcal: number,
    targetProteinG: number,
    limit: number = 10,
  ): Promise<MealSuggestion[]> {
    const foods = await this.prisma.food.findMany({
      where: { tenantId },
      orderBy: { proteinG: 'desc' },
      take: limit * 2,
    });

    const suggestions: MealSuggestion[] = [];
    let accKcal = 0;
    let accProtein = 0;

    for (const f of foods) {
      if (accKcal >= targetKcal * 0.9 && accProtein >= targetProteinG * 0.9) break;
      suggestions.push({
        food_id: f.foodId,
        description: f.description,
        kcal: f.kcal,
        protein_g: f.proteinG,
        carb_g: f.carbG,
        fat_g: f.fatG,
      });
      accKcal += f.kcal;
      accProtein += f.proteinG;
      if (suggestions.length >= limit) break;
    }

    return suggestions;
  }

  /**
   * Idade em anos a partir da data de nascimento.
   * Mínimo 18 anos: decisão de produto/arquitetura para evitar BMR/GCT irreal
   * em caso de data de nascimento incorreta ou usuários muito jovens.
   */
  private getAgeYears(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return Math.max(age, 18);
  }
}
