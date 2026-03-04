import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateGoalsDto } from './dto/update-goals.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { OnboardingService } from './onboarding.service';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Put('profile')
  async updateProfile(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<void> {
    await this.onboardingService.updateProfile(
      user.userId,
      user.tenantId,
      dto,
    );
  }

  @Put('goals')
  async defineGoals(
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateGoalsDto,
  ): Promise<void> {
    await this.onboardingService.defineGoals(
      user.userId,
      user.tenantId,
      dto,
    );
  }
}
