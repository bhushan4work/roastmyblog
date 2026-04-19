import { NextResponse } from 'next/server';
import { getRoastCount, getRecentRoasts } from '@/services/roastDbService';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const [count, recent] = await Promise.all([
      getRoastCount(),
      getRecentRoasts(10),
    ]);
    
    return NextResponse.json({ count, recent });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
