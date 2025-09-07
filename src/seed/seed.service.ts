import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { Application } from 'src/applications/entities/application.entity'; // 👈

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Role) private rolesRepo: Repository<Role>,
    @InjectRepository(Permission) private permsRepo: Repository<Permission>,
    @InjectRepository(Application) private appsRepo: Repository<Application>,
  ) {}

  async onModuleInit() {
    this.logger.log('Ejecutando seed automáticamente...');
    await this.runSeed();
  }

  async runSeed() {
    /** -----------------------------
     * 1. Seed de permisos
     * ----------------------------- */
    const permissions = [
      'users:view', 'users:create', 'users:update', 'users:delete',
      'roles:view', 'roles:create', 'roles:update', 'roles:delete',
      'permissions:view', 'permissions:create', 'permissions:update', 'permissions:delete',
    ];

    const existingPerms = await this.permsRepo.find();
    const newPerms = permissions
      .filter(p => !existingPerms.some(ep => ep.name === p))
      .map(p => this.permsRepo.create({ name: p, description: `Permiso ${p}` }));

    const savedPerms = await this.permsRepo.save(newPerms);

    /** -----------------------------
     * 2. Seed de rol admin
     * ----------------------------- */
    let adminRole = await this.rolesRepo.findOne({
      where: { name: 'admin' },
      relations: ['permissions'],
    });

    if (!adminRole) {
      adminRole = this.rolesRepo.create({
        name: 'admin',
        description: 'Rol con todos los permisos',
        permissions: [...existingPerms, ...savedPerms],
      });
      adminRole = await this.rolesRepo.save(adminRole);
    }

    /** -----------------------------
     * 3. Seed de usuario admin
     * ----------------------------- */
    let adminUser = await this.usersRepo.findOne({
      where: { email: 'admin@example.com' },
      relations: ['roles'],
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = this.usersRepo.create({
        email: 'admin@example.com',
        password: hashedPassword,
        roles: [adminRole],
        isActive: true,
      });
      adminUser = await this.usersRepo.save(adminUser);
    }

    /** -----------------------------
     * 4. Seed de aplicaciones (ERP, CRM, Intranet)
     * ----------------------------- */
    const applications = [
      { name: 'Api', description: 'Swagger de APIS', redirectUrl: 'https://localhost:3000' },
      { name: 'Admin Panel', description: 'Panel de administración del sistema', redirectUrl: 'https://admin.example.com' },
      { name: 'ERP', description: 'Sistema de planificación empresarial', redirectUrl: 'https://erp.example.com' },
      { name: 'CRM', description: 'Gestión de relaciones con clientes', redirectUrl: 'https://crm.example.com' },
      { name: 'Intranet', description: 'Portal interno de la empresa', redirectUrl: 'https://intranet.example.com' },
      { name: 'E-Commerce', description: 'Plataforma de comercio electrónico', redirectUrl: 'https://shop.example.com' },
      { name: 'HR Management', description: 'Gestión de recursos humanos', redirectUrl: 'https://hr.example.com' },
      { name: 'Project Management', description: 'Gestión de proyectos y tareas', redirectUrl: 'https://projects.example.com' },
      { name: 'Analytics Dashboard', description: 'Panel de análisis y reportes', redirectUrl: 'https://analytics.example.com' },
      { name: 'Support Portal', description: 'Portal de soporte y tickets', redirectUrl: 'https://support.example.com' },
      { name: 'Marketing Suite', description: 'Herramientas de marketing digital', redirectUrl: 'https://marketing.example.com' },
      { name: 'Finance Tracker', description: 'Seguimiento financiero y contabilidad', redirectUrl: 'https://finance.example.com' },
      { name: 'Inventory System', description: 'Sistema de gestión de inventarios', redirectUrl: 'https://inventory.example.com' },
      { name: 'Collaboration Hub', description: 'Centro de colaboración y comunicación', redirectUrl: 'https://collab.example.com' },
    ];

    for (const app of applications) {
      const exists = await this.appsRepo.findOne({ where: { name: app.name } });
      if (!exists) {
        const newApp = this.appsRepo.create(app);
        await this.appsRepo.save(newApp);
        this.logger.log(`✅ Aplicación creada: ${app.name}`);
      }
    }

    this.logger.log(
      `Seed ejecutado correctamente. Usuario admin: ${adminUser.email} / admin123`,
    );
  }
}
