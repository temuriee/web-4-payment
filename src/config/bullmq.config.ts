import { ConfigService } from '@nestjs/config';
import type { QueueOptions } from 'bullmq';
import { getRedisConfig } from './redis.config';

export function getBullmqConfig(configService: ConfigService): QueueOptions {
  return {
    connection: {
      // how many times to retry a command before giving up
      maxRetriesPerRequest: 5,
      // exponential backoff retry strategy = range: 50ms to 2000ms
      retryStrategy: (times) => Math.min(times * 50, 2000),

      // get redis config
      ...getRedisConfig(configService),
    },
    prefix: configService.getOrThrow<string>('QUEUE_PREFIX'),
  };
}
