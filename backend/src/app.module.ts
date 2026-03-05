import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { PlanModule } from './modules/plan/plan.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, OnboardingModule, PlanModule],
})
export class AppModule {}

