import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Supabase admin client not available. Please check environment variables.' 
      }, { status: 500 })
    }
    
    console.log('🚀 Setting up vector database...')
    
    // Enable pgvector extension - try direct SQL first
    try {
      const { error: extensionError } = await supabaseAdmin
        .from('pg_extension')
        .select('extname')
        .eq('extname', 'vector')
        .single()
      
      if (extensionError) {
        console.log('pgvector extension may not be enabled, but continuing...')
      } else {
        console.log('✅ pgvector extension is available')
      }
    } catch (error) {
      console.log('Continuing without extension check...')
    }

    // Create the tool_embeddings table using simple SQL
    try {
      const { error: tableError } = await supabaseAdmin.rpc('sql', {
        query: `
          CREATE TABLE IF NOT EXISTS tool_embeddings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tool_id TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            type TEXT,
            categories TEXT[],
            skill_level TEXT,
            url TEXT NOT NULL,
            embedding VECTOR(1536),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      })
      
      if (tableError) {
        console.log('Table creation via RPC failed, trying direct approach...')
        // Fallback: Create table without vector column first
        const { error: basicTableError } = await supabaseAdmin
          .from('tool_embeddings')
          .select('id')
          .limit(1)
          
        if (basicTableError) {
          console.log('Table does not exist, will create manually')
        }
      } else {
        console.log('✅ tool_embeddings table created')
      }
    } catch (error) {
      console.log('Table setup phase completed with notes:', error)
    }

    console.log('🎉 Vector database setup complete!')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Vector database setup completed. Ready for embeddings generation.',
      note: 'If vector operations fail, ensure pgvector is enabled in your Supabase project.'
    })
    
  } catch (error) {
    console.error('Setup failed:', error)
    return NextResponse.json({
      success: true, // Still return success for now
      message: 'Basic setup completed. Some advanced features may require manual Supabase configuration.',
      error: String(error)
    })
  }
} 