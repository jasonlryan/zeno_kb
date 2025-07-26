import { NextRequest, NextResponse } from 'next/server';
import { removeAsset } from '@/lib/assetManager';
import { getDataConfig, setDataConfig } from '@/lib/redisConfigManager';
import { ZenoConfig } from '@/types/config';
import { embeddingSyncService } from '@/lib/embeddingSyncService';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const removed = await removeAsset(id);
    if (!removed) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    // Automatically remove embedding for the deleted tool
    embeddingSyncService.onToolDeleted(id).catch(error => {
      console.error('Failed to delete embedding for tool:', error);
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await request.json();
    
    // Get current data from Redis
    const data = await getDataConfig() as ZenoConfig;
    
    // Find and update the tool
    const toolIndex = data.tools.findIndex((tool: any) => tool.id === id);
    if (toolIndex === -1) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    // Update the tool with new data and timestamp
    data.tools[toolIndex] = {
      ...data.tools[toolIndex],
      ...updates,
      date_modified: new Date().toISOString()
    };
    
    // Save back to Redis
    await setDataConfig(data);
    
    // Automatically update embedding for the modified tool
    embeddingSyncService.onToolUpdated(data.tools[toolIndex]).catch(error => {
      console.error('Failed to update embedding for tool:', error);
    });
    
    return NextResponse.json({ success: true, tool: data.tools[toolIndex] });
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}