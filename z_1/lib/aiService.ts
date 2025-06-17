import type { Tool } from "../types";

export class AIService {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    this.apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  }

  /**
   * Generate AI response with tool recommendations
   */
  async generateResponse(query: string, tools: Tool[]): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackResponse(query);
    }

    try {
      const prompt = this.createPrompt(query, tools);
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      };

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        return result.candidates[0].content.parts[0].text;
      } else {
        console.error("Unexpected API response structure:", result);
        return this.getFallbackResponse(query);
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return this.getFallbackResponse(query);
    }
  }

  /**
   * Create the prompt for the AI with tool context
   */
  private createPrompt(query: string, tools: Tool[]): string {
    const toolsContext = tools.map((tool) => ({
      title: tool.title,
      description: tool.description,
      tags: tool.tags,
      function: tool.function,
      tier: tool.tier,
      type: tool.type,
    }));

    return `User query: "${query}". 

Suggest relevant AI tools from the following list based on their title, description, tags, function, and type. Also, provide a brief caveat or best practice related to the tool's use.

Available tools: ${JSON.stringify(toolsContext)}

Format your response as a friendly suggestion, including the tool's title and a relevant caveat. For example: "Based on your query, 'X Tool' might be helpful. Caveat: Always verify sources and cross-reference data with reliable sources."

Keep the response conversational and helpful, focusing on 1-2 most relevant tools. Include practical advice about using the recommended tools effectively.`;
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
    return !!this.apiKey;
  }

  /**
   * Get configuration status message
   */
  getStatusMessage(): string {
    if (this.isConfigured()) {
      return "AI service is configured and ready";
    }
    return "AI service requires NEXT_PUBLIC_GEMINI_API_KEY environment variable";
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