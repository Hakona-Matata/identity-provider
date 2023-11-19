import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard, AuthGuard } from '../auth/guards';
import { CreateReportDto, ReportDto } from './dtos';
import { Serialize } from './../../shared/decorators';
import { ReportService } from './report.service';
import { CurrentUser } from '../user/decorators';
import { User } from '../user/user.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Controller('reports')
@UseGuards(AuthGuard, AdminGuard)
@Serialize(ReportDto)
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Post()
  async createReport(@Body() data: CreateReportDto, @CurrentUser() user: User) {
    return await this.reportService.create({ ...data, user });
  }

  @Patch('/:reportId')
  async approveReport(@Param('reportId') reportId: string) {
    return await this.reportService.approveReport({
      reportId: +reportId,
    });
  }

  @Get()
  async getEstimation(@Query() query: GetEstimateDto) {
    return await this.reportService.getEstimate(query);
  }
}
