import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { GoalsMotorService } from './services/goals-motor.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PlanController],
  providers: [PlanService, GoalsMotorService],
})
export class PlanModule {}
