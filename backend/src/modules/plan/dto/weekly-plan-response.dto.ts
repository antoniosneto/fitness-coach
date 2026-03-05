/** Resposta 201 de POST /api/v1/plans/weekly (contrato PRD/OpenAPI). */
export interface WeeklyPlanResponseDto {
  weekly_plan_id: string;
  start_date: string;
  end_date: string;
  target_kcal_per_day: number;
  summary: WeeklyPlanSummaryDto;
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
}
