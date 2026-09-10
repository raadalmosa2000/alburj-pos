import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cities = await prisma.city.findMany();
    return NextResponse.json({ success: true, data: cities });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch cities' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const city = await prisma.city.create({
      data: { name: body.name },
    });
    return NextResponse.json({ success: true, data: city });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create city' }, { status: 500 });
  }
}
