import { NextRequest, NextResponse } from 'next/server';
import { addAsset } from '@/lib/assetManager';
import { embeddingSyncService } from '@/lib/embeddingSyncService';

export async function POST(request: NextRequest) {
  try {
    const assetData = await request.json();
    const newAsset = await addAsset(assetData);
    
    // Automatically create embedding for the new tool
    embeddingSyncService.onToolCreated(newAsset).catch(error => {
      console.error('Failed to create embedding for new tool:', error);
    });
    
    return NextResponse.json({ success: true, tool: newAsset });
  } catch (error) {
    console.error('Error adding asset:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}