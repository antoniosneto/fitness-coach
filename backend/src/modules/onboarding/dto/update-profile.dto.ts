import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export const SEX_VALUES = ['male', 'female', 'other'] as const;
export type Sex = (typeof SEX_VALUES)[number];

export class UpdateProfileDto {
  @IsString()
  name!: string;

  @IsEnum(SEX_VALUES)
  sex!: Sex;

  @IsDateString()
  birth_date!: string;

  @IsNumber()
  @Min(20, { message: 'weight_kg deve ser no mínimo 20' })
  @Max(300, { message: 'weight_kg deve ser no máximo 300' })
  weight_kg!: number;

  @IsNumber()
  @Min(100, { message: 'height_cm deve ser no mínimo 100' })
  @Max(250, { message: 'height_cm deve ser no máximo 250' })
  height_cm!: number;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(60)
  body_fat_percentage?: number;

  @IsOptional()
  @IsString()
  body_fat_visual_id?: string;
}
