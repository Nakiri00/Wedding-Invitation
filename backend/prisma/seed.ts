// import { PrismaClient } from '@prisma/client'
// import { hashPassword } from '../src/lib/security.js'

// const prisma = new PrismaClient()

// async function main() {
//   const adminPassword = await hashPassword('ChangeMe123!')
//   const staffPassword = await hashPassword('ChangeMe123!')

//   await prisma.user.upsert({
//     where: { email: 'admin@example.com' },
//     update: {
//       passwordHash: adminPassword,
//       role: 'ADMIN',
//     },
//     create: {
//       email: 'admin@example.com',
//       name: 'Wedding Admin',
//       passwordHash: adminPassword,
//       role: 'ADMIN',
//     },
//   })

//   await prisma.user.upsert({
//     where: { email: 'staff@example.com' },
//     update: {
//       passwordHash: staffPassword,
//       role: 'STAFF',
//     },
//     create: {
//       email: 'staff@example.com',
//       name: 'Wedding Staff',
//       passwordHash: staffPassword,
//       role: 'STAFF',
//     },
//   })

//   // const token = '8fK2xP9m'

//   // await prisma.invitation.upsert({
//   //   where: { token },
//   //   update: {},
//   //   create: {
//   //     token,
//   //     guestName: 'Keluarga Bapak Ahmad',
//   //     contact: '+628123456789',
//   //     quota: 2,
//   //     guests: {
//   //       create: [
//   //         { name: 'Bapak Ahmad' },
//   //         { name: 'Ibu Ahmad' },
//   //       ],
//   //     },
//   //   },
//   // })

//   // console.log('Seeded admin/staff and invitation token:', token)
// }

// main()
//   .catch((error) => {
//     console.error(error)
//     process.exitCode = 1
//   })
//   .finally(async () => prisma.$disconnect())


// import { PrismaClient } from '@prisma/client'
// import { hashPassword } from '../src/lib/security.js'

// const prisma = new PrismaClient()

// async function main() {
//   const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
//   const password = process.env.ADMIN_PASSWORD
//   const name = process.env.ADMIN_NAME?.trim() || 'Wedding Admin'

//   if (!email || !password || password.length < 12) {
//     throw new Error(
//       'ADMIN_EMAIL dan ADMIN_PASSWORD wajib diatur. Password minimal 12 karakter.',
//     )
//   }

//   const passwordHash = await hashPassword(password)

//   await prisma.user.upsert({
//     where: { email },
//     update: {
//       name,
//       passwordHash,
//       role: 'ADMIN',
//     },
//     create: {
//       email,
//       name,
//       passwordHash,
//       role: 'ADMIN',
//     },
//   })

//   console.log(`Admin berhasil disiapkan: ${email}`)
// }

// main()
//   .catch((error) => {
//     console.error(error)
//     process.exitCode = 1
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })

import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/security.js'

const prisma = new PrismaClient()

function required(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} wajib diisi.`)
  return value
}

async function upsertUser(prefix: 'ADMIN' | 'STAFF') {
  const email = required(`${prefix}_EMAIL`).toLowerCase()
  const password = required(`${prefix}_PASSWORD`)
  if (password.length < 12) throw new Error(`${prefix}_PASSWORD minimal 12 karakter.`)
  const name = process.env[`${prefix}_NAME`]?.trim() || `Wedding ${prefix === 'ADMIN' ? 'Admin' : 'Staff'}`
  const passwordHash = await hashPassword(password)

  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: prefix },
    create: { email, name, passwordHash, role: prefix },
  })
  console.log(`${prefix} siap: ${email}`)
}

async function main() {
  await upsertUser('ADMIN')
  await upsertUser('STAFF')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())