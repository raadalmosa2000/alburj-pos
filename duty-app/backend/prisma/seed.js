const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Cities
  const idlib = await prisma.city.create({
    data: { name: 'إدلب' },
  })

  const ariha = await prisma.city.create({
    data: { name: 'أريحا' },
  })

  // Categories
  const pharmacy = await prisma.category.create({
    data: { name: 'صيدلية', slug: 'pharmacy' },
  })

  const clinic = await prisma.category.create({
    data: { name: 'عيادة', slug: 'clinic' },
  })

  // Facilities
  const facility1 = await prisma.facility.create({
    data: {
      name: 'صيدلية الشفاء',
      ownerName: 'د. أحمد',
      phone: '+96311111111',
      latitude: 35.931,
      longitude: 36.634,
      address: 'دوار الكرة، إدلب',
      cityId: idlib.id,
      categoryId: pharmacy.id,
    },
  })

  const facility2 = await prisma.facility.create({
    data: {
      name: 'صيدلية النور',
      ownerName: 'د. محمد',
      phone: '+96322222222',
      latitude: 35.811,
      longitude: 36.611,
      address: 'السوق، أريحا',
      cityId: ariha.id,
      categoryId: pharmacy.id,
    },
  })

  // Duty Schedule (Today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  await prisma.dutySchedule.create({
    data: {
      date: today,
      facilityId: facility1.id,
    },
  })

  await prisma.dutySchedule.create({
    data: {
      date: tomorrow,
      facilityId: facility2.id,
    },
  })

  console.log('Seed completed successfully')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
