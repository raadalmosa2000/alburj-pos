import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const facilityId = searchParams.get('facilityId');
  const cityId = searchParams.get('cityId');
  const dateStr = searchParams.get('date');

  try {
    let dateFilter = {};
    if (dateStr) {
      const date = new Date(dateStr);
      date.setHours(0,0,0,0);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      dateFilter = {
        date: {
          gte: date,
          lt: nextDate
        }
      }
    }

    const schedules = await prisma.dutySchedule.findMany({
      where: {
        ...(facilityId && { facilityId }),
        ...(cityId && { facility: { cityId } }),
        ...dateFilter
      },
      include: {
        facility: {
          include: {
            city: true,
            category: true,
          }
        }
      }
    });
    return NextResponse.json({ success: true, data: schedules });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch schedules' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const schedule = await prisma.dutySchedule.create({
      data: {
        date: new Date(body.date),
        facilityId: body.facilityId
      },
    });
    return NextResponse.json({ success: true, data: schedule });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create schedule' }, { status: 500 });
  }
}
