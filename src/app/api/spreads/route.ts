import { NextResponse } from 'next/server';
import { db } from '@/db';
import { spreads } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Spread } from '@/types/tarot';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'en';

  try {
    const data = await db.query.spreads.findMany({
      where: eq(spreads.lang, lang),
      with: {
        positions: true,
      },
    });

    // Map to Spread interface
    const formattedSpreads = data.map(s => ({
      id: s.slug, // Use slug as ID for frontend compatibility
      name: s.name,
      description: s.description,
      detail: s.detail || undefined,
      difficulty: (s.difficulty as Spread['difficulty']) || undefined,
      recommended: s.recommended || false,
      tags: s.tags || [],
      positions: s.positions.map(p => ({
        id: p.positionIndex,
        name: p.name,
        description: p.description,
        x: p.x,
        y: p.y
      })).sort((a, b) => parseInt(a.id) - parseInt(b.id)) // Ensure positions are ordered
    }));

    return NextResponse.json(formattedSpreads);
  } catch (error) {
    console.error('Error fetching spreads:', error);
    return NextResponse.json({ error: 'Failed to fetch spreads' }, { status: 500 });
  }
}
