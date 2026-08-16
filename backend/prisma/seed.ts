import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/security.js'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await hashPassword('ChangeMe123!')
  const staffPassword = await hashPassword('ChangeMe123!')
  await prisma.user.upsert({ where: { email: 'admin@example.com' }, update: { passwordHash: adminPassword, role: 'ADMIN' }, create: { email: 'admin@example.com', name: 'Wedding Admin', passwordHash: adminPassword, role: 'ADMIN' } })
  await prisma.user.upsert({ where: { email: 'staff@example.com' }, update: { passwordHash: staffPassword, role: 'STAFF' }, create: { email: 'staff@example.com', name: 'Wedding Staff', passwordHash: staffPassword, role: 'STAFF' } })

  const token = '8fK2xP9m'
  const invitation = await prisma.invitation.upsert({ where: { token }, update: {}, create: { token, guestName: 'Keluarga Bapak Ahmad', contact: '+628123456789', quota: 2, guests: { create: [{ name: 'Bapak Ahmad' }, { name: 'Ibu Ahmad' }] } } })
  await prisma.message.deleteMany({ where: { invitationId: invitation.id } })
  await prisma.message.createMany({ data: [
    { invitationId: invitation.id, guestName: 'Nadia & Fajar', message: 'Semoga menjadi keluarga yang selalu dipenuhi cinta, ketenangan, dan kebahagiaan.', status: 'PUBLISHED' },
    { invitationId: invitation.id, guestName: 'Rizky', message: 'Selamat menempuh hidup baru! Sampai bertemu di hari bahagia.', status: 'PUBLISHED' },
  ] })
  console.log('Seeded admin/staff and invitation token:', token)
}
main().catch((error) => { console.error(error); process.exitCode = 1 }).finally(async () => prisma.$disconnect())
