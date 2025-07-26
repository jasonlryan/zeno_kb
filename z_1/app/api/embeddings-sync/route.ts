import { NextRequest, NextResponse } from 'next/server';
import { embeddingSyncService } from '@/lib/embeddingSyncService';
import { getConfig } from '@/lib/redisConfigManager';
import type { Tool } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      // Get embedding sync statistics
      const stats = await embeddingSyncService.getStats();
      
      // Also get current tool count from Redis
      const dataConfig = await getConfig('data') as any;
      const toolCount = dataConfig?.tools?.length || 0;
      
      return NextResponse.json({
        success: true,
        stats: {
          ...stats,
          totalTools: toolCount,
          syncPercentage: toolCount > 0 ? Math.round((stats.totalEmbeddings / toolCount) * 100) : 0
        }
      });
    }

    if (action === 'check') {
      // Check sync status for a specific tool
      const toolId = searchParams.get('toolId');
      if (!toolId) {
        return NextResponse.json({ error: 'toolId parameter required' }, { status: 400 });
      }
      
      const hasEmbedding = await embeddingSyncService.hasEmbedding(toolId);
      return NextResponse.json({
        success: true,
        toolId,
        hasEmbedding
      });
    }

    return NextResponse.json({ error: 'Invalid action. Use: stats, check' }, { status: 400 });
    
  } catch (error) {
    console.error('Error in embeddings sync GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, toolId } = await request.json();

    if (action === 'sync-missing') {
      // Sync embeddings for tools that don't have them
      const dataConfig = await getConfig('data') as any;
      if (!dataConfig?.tools) {
        return NextResponse.json({ error: 'No tools found' }, { status: 400 });
      }

      const tools: Tool[] = dataConfig.tools;
      const missingEmbeddings: Tool[] = [];

      // Check which tools are missing embeddings
      for (const tool of tools) {
        const hasEmbedding = await embeddingSyncService.hasEmbedding(tool.id);
        if (!hasEmbedding) {
          missingEmbeddings.push(tool);
        }
      }

      if (missingEmbeddings.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'All tools already have embeddings',
          stats: { synced: 0, total: tools.length }
        });
      }

      // Sync missing embeddings
      const result = await embeddingSyncService.batchSync(missingEmbeddings);
      
      return NextResponse.json({
        success: true,
        message: `Synced ${result.success} missing embeddings`,
        stats: {
          synced: result.success,
          errors: result.errors,
          total: missingEmbeddings.length
        }
      });
    }

    if (action === 'force-resync') {
      // Force resync all embeddings
      const dataConfig = await getConfig('data') as any;
      if (!dataConfig?.tools) {
        return NextResponse.json({ error: 'No tools found' }, { status: 400 });
      }

      const tools: Tool[] = dataConfig.tools;
      const result = await embeddingSyncService.batchSync(tools);
      
      return NextResponse.json({
        success: true,
        message: `Force resynced all embeddings`,
        stats: {
          synced: result.success,
          errors: result.errors,
          total: tools.length
        }
      });
    }

    if (action === 'sync-one' && toolId) {
      // Sync a specific tool
      const dataConfig = await getConfig('data') as any;
      const tool = dataConfig?.tools?.find((t: Tool) => t.id === toolId);
      
      if (!tool) {
        return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
      }

      await embeddingSyncService.onToolUpdated(tool);
      
      return NextResponse.json({
        success: true,
        message: `Synced embedding for ${tool.title}`,
        toolId
      });
    }

    return NextResponse.json({ 
      error: 'Invalid action. Use: sync-missing, force-resync, sync-one' 
    }, { status: 400 });
    
  } catch (error) {
    console.error('Error in embeddings sync POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync embeddings' },
      { status: 500 }
    );
  }
} 