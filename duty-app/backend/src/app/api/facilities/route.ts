import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get('cityId');
  const categoryId = searchParams.get('categoryId');

  try {
    const facilities = await prisma.facility.findMany({
      where: {
        ...(cityId && { cityId }),
        ...(categoryId && { categoryId }),
      },
      include: {
        city: true,
        category: true,
      }
    });
    return NextResponse.json({ success: true, data: facilities });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch facilities' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const facility = await prisma.facility.create({
      data: body,
    });
    return NextResponse.json({ success: true, data: facility });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create facility' }, { status: 500 });
  }
}
