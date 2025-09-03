import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audit } from './entities/audit.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(Audit) private auditRepo: Repository<Audit>,
  ) {}

  async log(userId: string, module: string, action: string, details?: any) {
    const log = this.auditRepo.create({ userId, module, action, details });
    return this.auditRepo.save(log);
  }

  async findAll() {
    return this.auditRepo.find();
  }

  async findByUser(userId: string) {
    return this.auditRepo.find({ where: { userId } });
  }
}
