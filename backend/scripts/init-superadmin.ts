import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createSuperAdmin() {
  try {
    // Verificar se já existe um superadmin
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPERADMIN' }
    })

    if (existingSuperAdmin) {
      console.log('Superadmin já existe!')
      return
    }

    // Criar tenant padrão
    const defaultTenant = await prisma.tenant.create({
      data: {
        name: 'Sistema Principal',
        slug: 'sistema-principal',
        theme: 'default',
        isActive: true,
      }
    })

    // Criar superadmin
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const superAdmin = await prisma.user.create({
      data: {
        name: 'Super Administrador',
        email: 'admin@sistema.com',
        password: hashedPassword,
        role: 'SUPERADMIN',
        tenantId: defaultTenant.id,
        isActive: true,
      }
    })

    console.log('Superadmin criado com sucesso!')
    console.log('Email: admin@sistema.com')
    console.log('Senha: admin123')
    console.log('Tenant ID:', defaultTenant.id)
    
  } catch (error) {
    console.error('Erro ao criar superadmin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()
