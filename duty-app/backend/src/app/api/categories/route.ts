import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const category = await prisma.category.create({
      data: { name: body.name, slug: body.slug },
    });
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
  }
}
