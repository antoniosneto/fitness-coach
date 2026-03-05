import { IsBoolean } from 'class-validator';

export class UpdateTrainingPreferencesDto {
  @IsBoolean({ message: 'machines_only deve ser true ou false.' })
  machines_only!: boolean;
}
