import { IsEnum, IsInt, IsNumber, Min } from 'class-validator';

export const INTENSITY_VALUES = ['light', 'medium', 'high'] as const;
export type Intensity = (typeof INTENSITY_VALUES)[number];

export class UpdateGoalsDto {
  @IsNumber()
  @Min(20)
  current_weight_kg!: number;

  @IsNumber()
  @Min(5)
  current_body_fat_percent!: number;

  @IsNumber()
  @Min(20)
  target_weight_kg!: number;

  @IsNumber()
  @Min(5)
  target_body_fat_percent!: number;

  @IsInt()
  @Min(1, { message: 'months_to_target deve ser pelo menos 1' })
  months_to_target!: number;

  @IsEnum(INTENSITY_VALUES)
  intensity!: Intensity;
}
