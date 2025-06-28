import OpenAI from 'openai';
import type { Tool } from "../types";

// Load knowledge base data
let knowledgeBase: Tool[] = [];

// Initialize knowledge base from data.json
async function loadKnowledgeBase() {
  if (knowledgeBase.length === 0) {
    try {
      const response = await fetch('/api/knowledge-base');
      if (response.ok) {
        knowledgeBase = await response.json();
      }
    } catch (error) {
      console.error('Error loading knowledge base:', error);
      // Fallback to empty array
      knowledgeBase = [];
    }
  }
  return knowledgeBase;
}

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Only for client-side usage
    });
  }

  /**
   * Generate AI response with streaming support
   */
  async generateStreamingResponse(
    query: string, 
    tools: Tool[],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const knowledgeTools = await loadKnowledgeBase();
      const allTools = [...tools, ...knowledgeTools];
      const prompt = this.createPrompt(query, allTools);
      
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for the Zeno Knowledge Hub. You help users find relevant AI tools and resources from the knowledge base. Be conversational and provide practical advice. Focus on recommending the most relevant tools and explain why they would be useful for the user\'s specific needs.'
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
      const knowledgeTools = await loadKnowledgeBase();
      const allTools = [...tools, ...knowledgeTools];
      const prompt = this.createPrompt(query, allTools);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for the Zeno Knowledge Hub. You help users find relevant AI tools and resources from the knowledge base. Be conversational and provide practical advice. Focus on recommending the most relevant tools and explain why they would be useful for the user\'s specific needs.'
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
   * Create the prompt for the AI with tool context
   */
  private createPrompt(query: string, tools: Tool[]): string {
    // Get the most relevant tools (limit to avoid token limits)
    const relevantTools = tools.slice(0, 15).map((tool) => ({
      title: tool.title,
      description: tool.description,
      type: tool.type,
      function: tool.function,
      tags: tool.tags,
      tier: tool.tier,
      featured: tool.featured,
      link: tool.link
    }));

    return `User query: "${query}"

Based on the user's query, recommend the most relevant tools and resources from the Zeno Knowledge Hub below. 

Available Tools and Resources:
${JSON.stringify(relevantTools, null, 2)}

Instructions:
1. Recommend 1-2 most relevant tools or resources that best match the user's needs
2. Explain why they're suitable and how they can help
3. Provide practical tips for using them effectively
4. Include any relevant caveats or best practices
5. Be conversational and helpful in your response
6. If the user asks about specific topics (like audience insights, trends, marketing, etc.), prioritize tools with matching functions and tags
7. **IMPORTANT**: When mentioning a tool, include a clickable link using this exact format: [Tool Name](link_url)
8. Always include the link when recommending a specific tool

Format your response in a friendly, conversational manner that helps the user understand which tools would be most valuable for their specific needs. Make sure to include clickable links to the recommended tools.`;
  }

  /**
   * Fallback response when API is unavailable
   */
  private getFallbackResponse(query: string): string {
    const fallbackResponses = [
      `I understand you're asking about: **${query}**. Let me help you find the right tools and resources. I'd recommend exploring our tool library for relevant options.`,
      `Thanks for your question about **${query}**. While I'm experiencing some technical difficulties connecting to my AI service, I can suggest browsing our categorized tools to find what you need.`,
      `Great question about **${query}**! I'm currently unable to access my full AI capabilities, but you can use our search and filter features to discover relevant tools and resources.`,
    ];

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  /**
   * Check if the AI service is properly configured
   */
  isConfigured(): boolean {
    return !!process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  }

  /**
   * Get configuration status message
   */
  getStatusMessage(): string {
    if (this.isConfigured()) {
      return "AI service is configured and ready";
    }
    return "AI service requires NEXT_PUBLIC_OPENAI_API_KEY environment variable";
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null;

/**
 * Get the AI service instance
 */
export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
} 