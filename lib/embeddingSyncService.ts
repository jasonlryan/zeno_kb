/**
 * ZENO KB - Embedding Sync Service
 *
 * Orchestrates syncing of tool data with the vector store (Supabase pgvector).
 * Ensures that whenever a tool is created, updated, or deleted, the vector DB is kept in sync.
 * Used by API routes for tools and embedding sync.
 *
 * Essential for maintaining up-to-date semantic search in Zeno Knowledge Base.
 */
import { embeddingService } from './embeddingService';
import { supabaseAdmin } from './supabaseClient';

function ensureSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available');
  }
  return supabaseAdmin;
}
import type { Tool } from '../types';

export class EmbeddingSyncService {
  /**
   * Sync embedding when a tool is created
   */
  async onToolCreated(tool: Tool): Promise<void> {
    try {
      console.log(`🔄 Creating embedding for new tool: ${tool.title}`);
      await embeddingService.storeToolEmbedding(tool);
      console.log(`✅ Embedding created for: ${tool.title}`);
    } catch (error) {
      console.error(`❌ Failed to create embedding for ${tool.title}:`, error);
      // Don't throw - tool creation should succeed even if embedding fails
    }
  }

  /**
   * Sync embedding when a tool is updated
   */
  async onToolUpdated(tool: Tool): Promise<void> {
    try {
      console.log(`🔄 Updating embedding for tool: ${tool.title}`);
      await embeddingService.storeToolEmbedding(tool); // upsert will update existing
      console.log(`✅ Embedding updated for: ${tool.title}`);
    } catch (error) {
      console.error(`❌ Failed to update embedding for ${tool.title}:`, error);
      // Don't throw - tool update should succeed even if embedding fails
    }
  }

  /**
   * Remove embedding when a tool is deleted
   */
  async onToolDeleted(toolId: string): Promise<void> {
    try {
      if (!supabaseAdmin) {
        console.warn('Supabase admin client not available - skipping embedding deletion')
        return
      }
      
      console.log(`🔄 Deleting embedding for tool: ${toolId}`);
      
      const { error } = await supabaseAdmin
        .from('tool_embeddings')
        .delete()
        .eq('tool_id', toolId);

      if (error) {
        console.error(`❌ Failed to delete embedding for ${toolId}:`, error);
      } else {
        console.log(`✅ Embedding deleted for tool: ${toolId}`);
      }
    } catch (error) {
      console.error(`❌ Failed to delete embedding for ${toolId}:`, error);
      // Don't throw - tool deletion should succeed even if embedding cleanup fails
    }
  }

  /**
   * Batch sync multiple tools (for bulk operations)
   */
  async batchSync(tools: Tool[]): Promise<{ success: number; errors: number }> {
    console.log(`🚀 Batch syncing ${tools.length} tools...`);
    
    let success = 0;
    let errors = 0;

    for (const tool of tools) {
      try {
        await embeddingService.storeToolEmbedding(tool);
        success++;
        console.log(`✅ Synced: ${tool.title} (${success}/${tools.length})`);
      } catch (error) {
        errors++;
        console.error(`❌ Failed to sync ${tool.title}:`, error);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`🎉 Batch sync complete! Success: ${success}, Errors: ${errors}`);
    return { success, errors };
  }

  /**
   * Check if embedding exists for a tool
   */
  async hasEmbedding(toolId: string): Promise<boolean> {
    try {
      const { data, error } = await ensureSupabaseAdmin()
        .from('tool_embeddings')
        .select('id')
        .eq('tool_id', toolId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get embedding count and stats
   */
  async getStats(): Promise<{ totalEmbeddings: number; lastUpdated?: string }> {
    try {
      const { count, error } = await ensureSupabaseAdmin()
        .from('tool_embeddings')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      // Get last updated timestamp
      const { data: latest } = await ensureSupabaseAdmin()
        .from('tool_embeddings')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      return {
        totalEmbeddings: count || 0,
        lastUpdated: latest?.updated_at
      };
    } catch (error) {
      console.error('Failed to get embedding stats:', error);
      return { totalEmbeddings: 0 };
    }
  }
}

// Export singleton instance
export const embeddingSyncService = new EmbeddingSyncService(); 