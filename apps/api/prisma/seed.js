import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Password123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@unisphere.edu' },
    update: {},
    create: {
      email: 'admin@unisphere.edu',
      passwordHash: password,
      fullName: 'Admin User',
      role: 'ADMIN',
      department: 'Administration',
    },
  });

  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@unisphere.edu' },
    update: {},
    create: {
      email: 'organizer@unisphere.edu',
      passwordHash: password,
      fullName: 'Olivia Organizer',
      role: 'ORGANIZER',
      studentId: 'UNI-2023-0001',
      department: 'Tech Club',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@unisphere.edu' },
    update: {},
    create: {
      email: 'student@unisphere.edu',
      passwordHash: password,
      fullName: 'Alex Johnson',
      role: 'STUDENT',
      studentId: 'UNI-2023-0451',
      department: 'Computer Science',
    },
  });

  const events = [
    {
      title: 'Tech Innovation Summit',
      description:
        'Explore the latest in AI, blockchain, and emerging technologies with industry experts. Keynotes, workshops, and networking.',
      category: 'Technology',
      startsAt: new Date('2025-11-15T10:00:00Z'),
      endsAt: new Date('2025-11-15T17:00:00Z'),
      venue: 'Main Auditorium',
      capacity: 200,
      priceCents: 2500,
      requiresApproval: false,
      status: 'APPROVED',
      bannerUrl:
        'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Annual Cultural Fest',
      description:
        'A vibrant celebration of diverse cultures with performances, food, and art exhibitions.',
      category: 'Cultural',
      startsAt: new Date('2025-10-22T18:00:00Z'),
      endsAt: new Date('2025-10-22T23:00:00Z'),
      venue: 'Open Air Theater',
      capacity: 300,
      priceCents: 1500,
      requiresApproval: true,
      status: 'APPROVED',
      bannerUrl:
        'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Spring Career Fair',
      description:
        'Connect with top employers and explore internship and job opportunities across industries.',
      category: 'Career',
      startsAt: new Date('2025-12-05T09:00:00Z'),
      endsAt: new Date('2025-12-05T16:00:00Z'),
      venue: 'Student Center',
      capacity: 150,
      priceCents: 0,
      requiresApproval: false,
      status: 'APPROVED',
      bannerUrl:
        'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Winter Sports Tournament',
      description:
        'Compete in basketball, soccer, and volleyball. Open to all students. Prizes for winners.',
      category: 'Sports',
      startsAt: new Date('2025-12-12T08:00:00Z'),
      endsAt: new Date('2025-12-12T18:00:00Z'),
      venue: 'University Stadium',
      capacity: 100,
      priceCents: 1000,
      requiresApproval: false,
      status: 'APPROVED',
      bannerUrl:
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
    },
  ];

  for (const e of events) {
    const exists = await prisma.event.findFirst({ where: { title: e.title } });
    if (!exists) {
      await prisma.event.create({
        data: { ...e, organizerId: organizer.id },
      });
    }
  }

  console.log('✅ Seed complete');
  console.log('   Admin:     admin@unisphere.edu / Password123!');
  console.log('   Organizer: organizer@unisphere.edu / Password123!');
  console.log('   Student:   student@unisphere.edu / Password123!');
  console.log('   (ids:', { admin: admin.id, organizer: organizer.id, student: student.id }, ')');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());