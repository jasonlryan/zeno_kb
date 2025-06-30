"use client";

import { useState, useCallback } from "react";
import type { Message, Tool } from "../types";
import { getAIService } from "../lib/aiService";

export function useAIChat(tools: Tool[]) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I help you with Zeno Knows today? Ask me about our AI tools and I'll recommend the best ones for your needs.",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: content.trim(),
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Get AI response
        const aiService = getAIService();
        const aiResponse = await aiService.generateResponse(content, tools);

        // Add AI response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Error getting AI response:", error);
        
        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I'm sorry, I'm experiencing some technical difficulties. Please try again later or browse our tool library directly.",
          sender: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [tools, isLoading]
  );

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: "1",
        content: "Hello! How can I help you with Zeno Knows today? Ask me about our AI tools and I'll recommend the best ones for your needs.",
        sender: "assistant",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const getServiceStatus = useCallback(() => {
    const aiService = getAIService();
    return {
      isConfigured: aiService.isConfigured(),
      statusMessage: aiService.getStatusMessage(),
    };
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    getServiceStatus,
  };
} 