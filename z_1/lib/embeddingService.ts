import OpenAI from 'openai'
import { supabaseAdmin, type ToolEmbedding, type SearchResult } from './supabaseClient'
import type { Tool } from '../types'

// Create OpenAI client only on server-side
function getOpenAIClient() {
  if (typeof window !== 'undefined') {
    throw new Error('OpenAI client should only be used on server-side')
  }
  
  return new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // Use the env var you have
  })
}

export class EmbeddingService {
  /**
   * Generate embedding for text using OpenAI
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const openai = getOpenAIClient()
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
      })
      
      return response.data[0].embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      throw error
    }
  }

  /**
   * Create embedding text from tool data
   */
  createEmbeddingText(tool: Tool): string {
    const parts = [
      tool.title,
      tool.description || '',
      tool.type || '',
      ...(tool.categories || []),
      tool.skillLevel || '',
      ...(tool.tags || []),
      tool.function || ''
    ].filter(Boolean)

    return parts.join(' ')
  }

  /**
   * Store tool embedding in Supabase
   */
  async storeToolEmbedding(tool: Tool): Promise<void> {
    try {
      if (!supabaseAdmin) {
        console.warn('Supabase admin client not available - skipping embedding storage')
        return
      }
      
      const embeddingText = this.createEmbeddingText(tool)
      const embedding = await this.generateEmbedding(embeddingText)

      // Convert embedding array to string format for storage
      const embeddingString = `[${embedding.join(',')}]`

      const toolEmbedding = {
        tool_id: tool.id,
        title: tool.title,
        description: tool.description || '',
        type: tool.type || '',
        categories: tool.categories || [],
        skill_level: tool.skillLevel,
        url: tool.url,
        embedding: embeddingString
      }

      const { error } = await supabaseAdmin
        .from('tool_embeddings')
        .upsert(toolEmbedding, { 
          onConflict: 'tool_id',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error('Error storing tool embedding:', error)
        throw error
      }

      console.log(`✅ Stored embedding for tool: ${tool.title}`)
    } catch (error) {
      console.error(`❌ Failed to store embedding for tool ${tool.title}:`, error)
      throw error
    }
  }

  /**
   * Batch process tools for embeddings
   */
  async processToolsForEmbeddings(tools: Tool[]): Promise<void> {
    console.log(`🚀 Processing ${tools.length} tools for embeddings...`)
    
    for (let i = 0; i < tools.length; i++) {
      const tool = tools[i]
      try {
        await this.storeToolEmbedding(tool)
        console.log(`Progress: ${i + 1}/${tools.length}`)
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`Failed to process tool ${tool.title}:`, error)
        // Continue with next tool
      }
    }
    
    console.log('✅ Finished processing all tools')
  }

  /**
   * Semantic search using vector similarity (with fallback)
   */
  async semanticSearch(query: string, limit: number = 10, threshold: number = 0.7): Promise<SearchResult[]> {
    try {
      if (!supabaseAdmin) {
        console.warn('Supabase admin client not available - falling back to keyword search')
        return await this.fallbackSearch(query, limit)
      }
      
      // Generate embedding for the search query
      const queryEmbedding = await this.generateEmbedding(query)

      // Try vector similarity search first
      try {
        const { data, error } = await supabaseAdmin!.rpc('search_tools', {
          query_embedding: queryEmbedding,
          match_threshold: threshold,
          match_count: limit
        })

        if (error) {
          console.log('Vector search function not available, using fallback')
          return await this.fallbackSearch(query, limit)
        }

        return data || []
      } catch (error) {
        console.log('Vector search failed, using fallback:', error)
        return await this.fallbackSearch(query, limit)
      }
    } catch (error) {
      console.error('Semantic search failed completely:', error)
      return await this.fallbackSearch(query, limit)
    }
  }

  /**
   * Fallback search when vector search isn't available
   */
  private async fallbackSearch(query: string, limit: number): Promise<SearchResult[]> {
    try {
      if (!supabaseAdmin) {
        console.warn('Supabase admin client not available - returning empty results')
        return []
      }
      
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2)
      
      let queryBuilder = supabaseAdmin!
        .from('tool_embeddings')
        .select('*')
        .limit(limit)

      // Build OR conditions for keyword matching
      if (searchTerms.length > 0) {
        const orConditions = searchTerms.map(term => 
          `title.ilike.%${term}%,description.ilike.%${term}%,type.ilike.%${term}%`
        ).join(',')
        
        queryBuilder = queryBuilder.or(orConditions)
      }

      const { data, error } = await queryBuilder

      if (error) throw error

      return (data || []).map(item => ({
        ...item,
        similarity: 0.6 // Default similarity for keyword matches
      }))
    } catch (error) {
      console.error('Fallback search failed:', error)
      return []
    }
  }

  /**
   * Hybrid search combining semantic and keyword search
   */
  async hybridSearch(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      // Try semantic search first
      const semanticResults = await this.semanticSearch(query, Math.ceil(limit * 0.8))
      
      if (semanticResults.length > 0) {
        return semanticResults.slice(0, limit)
      }
      
      // Fallback to pure keyword search
      return await this.fallbackSearch(query, limit)
        
    } catch (error) {
      console.error('Hybrid search failed:', error)
      return await this.fallbackSearch(query, limit)
    }
  }
}

// Export singleton instance
export const embeddingService = new EmbeddingService() 