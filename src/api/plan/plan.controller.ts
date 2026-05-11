import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PlanResponse } from './dto';
import { PlanService } from './plan.service';

@ApiTags('Plans')
@Controller('plans')
export class PlanController {
  public constructor(private readonly planService: PlanService) {}

  @ApiOperation({
    summary: 'Get all subscription plans',
    description:
      'Returns a list of all available plans, sorted by monthly price',
  })
  @ApiOkResponse({
    type: [PlanResponse],
  })
  @Get()
  public async getAll() {
    return await this.planService.getAll();
  }

  @ApiOperation({
    summary: 'Get a subscription plan by ID',
    description: 'Returns detailed information about a specific plan by its ID',
  })
  @ApiOkResponse({
    type: PlanResponse,
  })
  @Get(':id')
  public async getById(@Param('id') id: string) {
    return await this.planService.getById(id);
  }
}
