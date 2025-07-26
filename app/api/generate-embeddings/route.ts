import { NextRequest, NextResponse } from 'next/server'
import { embeddingService } from '@/lib/embeddingService'
import { getConfig } from '@/lib/redisConfigManager'
import type { Tool } from '@/types'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Generating embeddings for all tools...')
    
    // Get tools from Redis data config
    const dataConfig = await getConfig('data') as any
    
    if (!dataConfig || !dataConfig.tools || !Array.isArray(dataConfig.tools)) {
      return NextResponse.json(
        { success: false, error: 'No tools found in data config' },
        { status: 400 }
      )
    }

    const tools: Tool[] = dataConfig.tools
    console.log(`Found ${tools.length} tools to process`)

    // Process tools in batches to avoid overwhelming the API
    const batchSize = 5
    let processed = 0
    let errors = 0

    for (let i = 0; i < tools.length; i += batchSize) {
      const batch = tools.slice(i, i + batchSize)
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(tools.length / batchSize)}`)
      
      const batchPromises = batch.map(async (tool) => {
        try {
          await embeddingService.storeToolEmbedding(tool)
          processed++
        } catch (error) {
          console.error(`Failed to process ${tool.title}:`, error)
          errors++
        }
      })
      
      await Promise.all(batchPromises)
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < tools.length) {
        console.log('Waiting 2 seconds before next batch...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    console.log(`✅ Embedding generation complete! Processed: ${processed}, Errors: ${errors}`)
    
    return NextResponse.json({
      success: true,
      message: 'Embeddings generated successfully',
      stats: {
        total: tools.length,
        processed,
        errors
      }
    })
    
  } catch (error) {
    console.error('Error generating embeddings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate embeddings', details: error },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current embedding count
    const { supabaseAdmin } = await import('@/lib/supabaseClient')
    
    if (!supabaseAdmin) {
      return NextResponse.json({ count: 0 })
    }
    
    const { count, error } = await supabaseAdmin
      .from('tool_embeddings')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({
      success: true,
      embeddingCount: count || 0,
      message: `${count || 0} tool embeddings currently stored`
    })
    
  } catch (error) {
    console.error('Error getting embedding count:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get embedding count' },
      { status: 500 }
    )
  }
} 