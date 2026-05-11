import { ApiProperty } from '@nestjs/swagger';

export class PlanResponse {
  @ApiProperty({
    description: 'Unique identifier of the plan',
    example: '27NcADa45K47cgujciJMf',
  })
  public id: string;

  @ApiProperty({
    description: 'Name of the subscription plan',
    example: 'Premium',
  })
  public title: string;

  @ApiProperty({
    description: 'Description of the subscription plan',
    example: 'Full access to all platform features',
  })
  public description: string;

  @ApiProperty({
    description: 'List of features included of the plan',
    example: [
      'Unlimited access to content',
      'Priority support',
      'Advanced analytics',
    ],
    isArray: true,
    type: String,
  })
  public features: string[];

  @ApiProperty({
    description: 'Monthly price',
    example: 999,
  })
  public monthlyPrice: number;

  @ApiProperty({
    description: 'Yearly price',
    example: 9990,
  })
  public yearlyPrice: number;

  @ApiProperty({
    description: 'Indicates whether the plan is featured or promoted',
    example: true,
  })
  public isFeatured: boolean;
}
