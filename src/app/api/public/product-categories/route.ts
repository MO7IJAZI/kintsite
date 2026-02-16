import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { 
        isActive: true, 
        parentId: null,
        NOT: {
          slug: {
            in: ['animal', 'vet', 'crop-guides', 'by-animal']
          }
        }
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        name_ar: true,
        slug: true,
        description: true,
        description_ar: true,
        children: {
          where: { isActive: true },
          orderBy: [{ order: 'asc' }, { name: 'asc' }],
          select: {
            id: true,
            name: true,
            name_ar: true,
            slug: true,
          }
        }
      }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching product categories:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
