import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get('cityId');
  const categorySlug = searchParams.get('categorySlug');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const schedules = await prisma.dutySchedule.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        facility: {
          ...(cityId && { cityId }),
          ...(categorySlug && { category: { slug: categorySlug } }),
        },
      },
      include: {
        facility: {
          include: {
            city: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: schedules });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch today duty' }, { status: 500 });
  }
}
