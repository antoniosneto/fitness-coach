/** Resposta 201 de POST /api/v1/plans/weekly (contrato PRD/OpenAPI). */
export interface WeeklyPlanResponseDto {
  weekly_plan_id: string;
  start_date: string;
  end_date: string;
  target_kcal_per_day: number;
  summary: WeeklyPlanSummaryDto;
}

/** Um dia da rotina semanal de treino (SCN-TRAIN-ROTINA-MAQUINAS). day_of_week em ISO: 1=segunda .. 7=domingo. */
export interface WeeklyTrainingDayDto {
  day_of_week: number;
  day_name: string;
  type: 'rest' | 'active_rest' | 'upper_body' | 'legs' | 'training';
  description: string;
}

export interface WeeklyPlanSummaryDto {
  daily_targets: {
    kcal: number;
    protein_g: number;
    carb_g: number;
    fat_g: number;
  };
  suggested_meals: Array<{
    food_id: string;
    description: string;
    kcal: number;
    protein_g: number;
    carb_g: number;
    fat_g: number;
  }>;
  /** Estrutura semanal de treino (REQ-PLAN-001, SCN-TRAIN-ROTINA-MAQUINAS). */
  weekly_training: WeeklyTrainingDayDto[];
  /** Quando true, sugestões de exercício devem priorizar máquinas (excluir peso livre). Preferência virá de onboarding quando existir. */
  machines_only: boolean;
}
