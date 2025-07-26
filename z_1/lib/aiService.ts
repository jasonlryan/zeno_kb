import OpenAI from 'openai';
import type { Tool } from "../types";
import type { SearchResult } from './supabaseClient';

// Helper function to perform semantic search via API
async function performSemanticSearch(query: string, limit: number = 10): Promise<SearchResult[]> {
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit }),
    });
    
    if (!response.ok) {
      throw new Error('Search API request failed');
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error calling search API:', error);
    return [];
  }
}

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
    tags: result.categories, // Use categories as tags for now
    function: result.type, // Use type as function for now
    tier: 'Foundation', // Default tier
    featured: false, // Default featured
    similarity: result.similarity
  };
}

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
  }

  /**
   * Generate AI response with streaming support and vector search
   */
  async generateStreamingResponse(
    query: string, 
    tools: Tool[],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      // Use semantic search to find relevant tools
      const semanticResults = await performSemanticSearch(query, 10);
      const relevantTools = semanticResults.map((result: SearchResult) => searchResultToTool(result));
      
      // Combine with any provided tools (for backwards compatibility)
      const allTools = [...tools, ...relevantTools];
      
      const prompt = this.createPrompt(query, allTools);
      
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant for the Zeno Knowledge Hub. You help users find relevant AI tools and resources using semantic search. 

Key capabilities:
- Use semantic understanding to recommend the most relevant tools
- Provide practical advice and explain why tools are suitable
- Focus on the highest similarity matches when multiple tools are available
- Be conversational and helpful in your responses

When recommending tools:
1. Prioritize tools with higher similarity scores (if available)
2. Explain why each tool is relevant to the user's specific needs
3. Include practical tips for using them effectively
4. Always include clickable links: [Tool Name](url)
5. Mention any relevant caveats or best practices`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          onChunk(content);
        }
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      onChunk(this.getFallbackResponse(query));
    }
  }

  /**
   * Generate AI response (non-streaming version for compatibility)
   */
  async generateResponse(query: string, tools: Tool[]): Promise<string> {
    try {
      // Use semantic search to find relevant tools
      const semanticResults = await performSemanticSearch(query, 10);
      const relevantTools = semanticResults.map((result: SearchResult) => searchResultToTool(result));
      
      // Combine with any provided tools
      const allTools = [...tools, ...relevantTools];
      
      const prompt = this.createPrompt(query, allTools);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant for the Zeno Knowledge Hub. You help users find relevant AI tools and resources using semantic search. 

Key capabilities:
- Use semantic understanding to recommend the most relevant tools
- Provide practical advice and explain why tools are suitable
- Focus on the highest similarity matches when multiple tools are available
- Be conversational and helpful in your responses

When recommending tools:
1. Prioritize tools with higher similarity scores (if available)
2. Explain why each tool is relevant to the user's specific needs
3. Include practical tips for using them effectively
4. Always include clickable links: [Tool Name](url)
5. Mention any relevant caveats or best practices`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return response.choices[0]?.message?.content || this.getFallbackResponse(query);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return this.getFallbackResponse(query);
    }
  }

  /**
   * Create the prompt for the AI with tool context (updated for vector search)
   */
  private createPrompt(query: string, tools: Tool[]): string {
    // Sort tools by similarity if available, limit to avoid token limits
    const sortedTools = tools
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, 15);

    const relevantTools = sortedTools.map((tool) => ({
      title: tool.title,
      description: tool.description,
      type: tool.type,
      function: tool.function,
      tags: tool.tags,
      tier: tool.tier,
      featured: tool.featured,
      url: tool.url,
      similarity: tool.similarity || 'N/A'
    }));

    return `User query: "${query}"

Based on the user's query, I found these relevant tools using semantic search. Tools are ranked by relevance/similarity to your query:

Available Tools and Resources:
${JSON.stringify(relevantTools, null, 2)}

Instructions:
1. Recommend 1-3 most relevant tools that best match the user's needs
2. Consider the similarity scores - higher scores indicate better matches
3. Explain why they're suitable and how they can help with the specific query
4. Provide practical tips for using them effectively
5. Include any relevant caveats or best practices
6. Be conversational and helpful in your response
7. **IMPORTANT**: When mentioning a tool, include a clickable link using this exact format: [Tool Name](url)
8. Always include the link when recommending a specific tool
9. If similarity scores are available, you can mention how well-matched a tool is

Format your response in a friendly, conversational manner that helps the user understand which tools would be most valuable for their specific needs based on semantic similarity.`;
  }

  /**
   * Fallback response when AI service fails
   */
  private getFallbackResponse(query: string): string {
    return `I'm sorry, I'm experiencing some technical difficulties with my AI response system. However, I can still help you find relevant tools! 

Try browsing our tool categories or use the search function to find tools related to "${query}". You can also check out our featured tools section for popular recommendations.

Please try your question again in a moment, or feel free to explore the tools directly.`;
  }
}

// Export factory function for lazy initialization
export function getAIService(): AIService {
  return new AIService();
} 