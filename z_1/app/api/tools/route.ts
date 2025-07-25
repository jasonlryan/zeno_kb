import { NextRequest, NextResponse } from 'next/server';
import { addAsset } from '@/lib/assetManager';

export async function POST(request: NextRequest) {
  try {
    const assetData = await request.json();
    const newAsset = addAsset(assetData);
    return NextResponse.json({ success: true, tool: newAsset });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}