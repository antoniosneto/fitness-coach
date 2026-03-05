import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { WeeklyPlanResponseDto } from './dto/weekly-plan-response.dto';
import { PlanService } from './plan.service';

@Controller('plans')
@UseGuards(JwtAuthGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  /**
   * Gera plano semanal (Motor de Metas: GCT, déficit, TACO).
   * 201: plano gerado; 422: onboarding incompleto.
   */
  @Post('weekly')
  @HttpCode(HttpStatus.CREATED)
  async generateWeekly(
    @CurrentUser() user: JwtUser,
  ): Promise<WeeklyPlanResponseDto> {
    return this.planService.generateWeeklyPlan(user.userId, user.tenantId);
  }
}
