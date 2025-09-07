import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
  ) {}

  async create(dto: CreateApplicationDto): Promise<Application> {
    const app = this.applicationsRepository.create(dto);
    return this.applicationsRepository.save(app);
  }

  async findAll(): Promise<Application[]> {
    return this.applicationsRepository.find({
      relations: ['permissions', 'users'],
    });
  }

  async findOne(id: string): Promise<Application> {
    const app = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['permissions', 'users'],
    });
    if (!app) throw new NotFoundException(`Application ${id} not found`);
    return app;
  }

  async update(id: string, dto: UpdateApplicationDto): Promise<Application> {
    const app = await this.findOne(id);
    Object.assign(app, dto);
    return this.applicationsRepository.save(app);
  }

  async remove(id: string): Promise<void> {
    const app = await this.findOne(id);
    await this.applicationsRepository.remove(app);
  }
}
