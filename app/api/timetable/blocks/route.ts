import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const universitySlug = searchParams.get('universitySlug') || searchParams.get('slug') || 'lpu';

    const blocks = await prisma.block.findMany({
      where: { universityId: universitySlug },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      universitySlug,
      blocks: blocks.map((b) => ({
        id: b.id,
        name: b.name,
        walkingMinutes: JSON.parse(b.walkingMinutes || '{}'),
        shareDistribution: JSON.parse(b.shareDistribution || '{}'),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const universitySlug = body.universitySlug || body.slug || 'lpu';
    const blockName = body.name;

    if (!blockName) {
      return NextResponse.json({ error: 'Block name is required.' }, { status: 400 });
    }

    const walkingMinutes = body.walkingMinutes ? JSON.stringify(body.walkingMinutes) : '{}';
    const shareDistribution = body.shareDistribution ? JSON.stringify(body.shareDistribution) : '{}';

    const block = await prisma.block.upsert({
      where: {
        universityId_name: {
          universityId: universitySlug,
          name: blockName,
        },
      },
      create: {
        universityId: universitySlug,
        name: blockName,
        walkingMinutes,
        shareDistribution,
      },
      update: {
        walkingMinutes,
        shareDistribution,
      },
    });

    return NextResponse.json({
      success: true,
      block: {
        id: block.id,
        name: block.name,
        walkingMinutes: JSON.parse(block.walkingMinutes),
        shareDistribution: JSON.parse(block.shareDistribution),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
