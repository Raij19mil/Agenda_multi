import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Método para executar queries em schemas específicos de tenant
  async executeInTenantSchema(tenantId: string, query: string, params: any[] = []) {
    // Para multi-tenancy com schemas separados, seria necessário
    // executar queries SQL diretas com o nome do schema
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
    return this.$queryRawUnsafe(query.replace('{schema}', schemaName), ...params);
  }
}
