import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
import { UsersModule } from './users/users.module';
import { PlanModule } from './plan/plan.module';

@Module({
  imports: [AuthModule, UsersModule, PlanModule /* UsersModule */],
})
export class ApiModule {}
