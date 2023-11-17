import { InjectRepository } from '@nestjs/typeorm';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ApproveReportDto, CreateReportDto } from './dtos';
import { Report } from './report.entity';
import { Repository } from 'typeorm';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report) private reportRepository: Repository<Report>,
  ) {}

  async create(data: CreateReportDto) {
    const report = await this.reportRepository.create(data);

    return await this.reportRepository.save(report);
  }

  async approveReport(data: ApproveReportDto) {
    const report = await this.reportRepository.findOneBy({
      id: data.reportId,
    });

    if (!report) throw new NotFoundException('The report is not found!');

    report.isApproved = true;

    const isApproved = await this.reportRepository.save(report);

    if (!isApproved)
      throw new InternalServerErrorException(
        'The report approve process failed!',
      );

    return isApproved;
  }

  async getEstimate(query: Partial<GetEstimateDto>) {
    return await this.reportRepository
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('manufacture = :manufacture', {
        manufacture: query.manufacture,
      })
      .andWhere('model = :model', { model: query.model })
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng: query.lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat: query.lat })
      .andWhere('isApproved IS TRUE')
      .orderBy('ABS(milage - :milage)', 'DESC')
      .setParameter('milage', query.milage)
      .limit(3)
      .getRawOne();
  }
}
