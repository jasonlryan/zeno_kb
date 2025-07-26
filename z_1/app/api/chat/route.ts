import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { embeddingService } from '@/lib/embeddingService'
import type { Tool } from '@/types'
import type { SearchResult } from '@/lib/supabaseClient'

// Create OpenAI client (server-side only)
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})

// Convert SearchResult to Tool format for compatibility
function searchResultToTool(result: SearchResult): Tool {
  return {
    id: result.tool_id,
    title: result.title,
    description: result.description,
    type: result.type,
    categories: result.categories,
    skillLevel: result.skill_level,
    url: result.url,
    tier: 'Foundation' as const,
    similarity: result.similarity
  }
}

function createPrompt(query: string, tools: Tool[]): string {
  const systemPrompt = `You are a helpful AI assistant for Zeno KB, a knowledge base of AI tools and resources. Your role is to help users find the most relevant tools for their needs.

IMPORTANT GUIDELINES:
- Always prioritize tools with higher similarity scores (closer to 1.0) as they are more relevant to the user's query
- Use the similarity scores to determine which tools are most relevant
- Be conversational and helpful
- Provide specific tool recommendations based on the user's query
- Include brief descriptions of why each tool is relevant
- If no highly relevant tools are found (all similarity scores below 0.7), acknowledge this and suggest broader categories

Available tools context (sorted by relevance/similarity):
${tools.map(tool => 
  `Tool: ${tool.title}
   Description: ${tool.description}
   Type: ${tool.type}
   Similarity: ${tool.similarity || 'N/A'}
   URL: ${tool.url}`
).join('\n\n')}

User Query: ${query}`

  return systemPrompt
}

export async function POST(request: NextRequest) {
  try {
    const { query, streaming = false } = await request.json()
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Use semantic search to find relevant tools
    const semanticResults = await embeddingService.hybridSearch(query, 10)
    const relevantTools = semanticResults.map((result: SearchResult) => searchResultToTool(result))
    
    const prompt = createPrompt(query, relevantTools)
    
    if (streaming) {
      // Return streaming response
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ],
        stream: true,
        max_tokens: 1000,
        temperature: 0.7,
      })

      // Create a readable stream
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || ''
              if (content) {
                controller.enqueue(encoder.encode(content))
              }
            }
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        },
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      })
    } else {
      // Return regular response
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })

      const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
      
      return NextResponse.json({ response, tools: relevantTools })
    }
  } catch (error) {
    console.error('Error in AI chat:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI response' }, 
      { status: 500 }
    )
  }
} 