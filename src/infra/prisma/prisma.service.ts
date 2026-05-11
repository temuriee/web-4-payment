import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    super({
      adapter: new PrismaPg({
        connectionString,
      }),
    });
  }

  async onModuleInit() {
    this.logger.log('🔄 Initializing database connection...');
    await this.$connect();
    this.logger.log('✅ Database connection established successfully.');
  }

  async onModuleDestroy() {
    this.logger.log('🔻 Closing database connection...');
    await this.$disconnect();
    this.logger.log('🟢 Database connection closed successfully.');
  }
}
