"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnalytics } from "../hooks/useAnalytics";
import type { Message } from "../types";

interface ChatPanelProps {
  messages: Message[];
  onSend: (message: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function ChatPanel({
  messages,
  onSend,
  isLoading = false,
  className,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [autoScroll]);

  // Auto-scroll when new messages arrive, but only if auto-scroll is enabled
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle manual scrolling - disable auto-scroll if user scrolls up
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;

    // Only re-enable auto-scroll if user scrolls back to bottom
    if (isAtBottom && !autoScroll) {
      setAutoScroll(true);
    } else if (!isAtBottom && autoScroll) {
      setAutoScroll(false);
    }
  }, [autoScroll]);

  // Disable auto-scroll on any user interaction
  const handleUserInteraction = useCallback(() => {
    if (autoScroll) {
      setAutoScroll(false);
    }
  }, [autoScroll]);

  // Re-enable auto-scroll when starting to send a new message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      setAutoScroll(true); // Re-enable auto-scroll for new conversation
      onSend(input.trim());
      setInput("");

      // Keep focus on input field and prevent page scrolling
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const renderMarkdown = (content: string) => {
    // Enhanced markdown rendering with better styling and link support
    return content
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-foreground dark:text-white">$1</strong>'
      )
      .replace(
        /\*(.*?)\*/g,
        '<em class="italic text-gray-800 dark:text-gray-200">$1</em>'
      )
      .replace(
        /`(.*?)`/g,
        '<code class="bg-gray-200 dark:bg-gray-600 text-foreground dark:text-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>'
      )
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-green-600 hover:text-green-700 underline font-medium">$1 ↗</a>'
      )
      .replace(/\n\n/g, '</p><p class="mt-3">')
      .replace(/\n/g, "<br>")
      .replace(/^(.+)$/, "<p>$1</p>");
  };

  return (
    <div
      className={cn(
        "flex flex-col h-[480px] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden",
        className
      )}
      onMouseDown={handleUserInteraction}
      onTouchStart={handleUserInteraction}
      onKeyDown={handleUserInteraction}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-green-600 rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-white" />
          <h3 className="font-semibold text-white">Ask Zeno AI</h3>
        </div>
        {!autoScroll && (
          <button
            onClick={() => {
              setAutoScroll(true);
              scrollToBottom();
            }}
            className="text-xs text-white hover:text-gray-200 px-3 py-1 rounded-full bg-green-700 hover:bg-green-800 border border-green-500 transition-colors"
          >
            ↓ Resume auto-scroll
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto zeno-content-padding space-y-4 bg-muted dark:bg-gray-900"
        onScroll={handleScroll}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] px-4 py-3 rounded-lg shadow-sm",
                message.sender === "user"
                  ? "bg-green-600 text-white"
                  : "bg-white dark:bg-gray-800 text-foreground dark:text-white border border-gray-200 dark:border-gray-700"
              )}
            >
              <div
                className={cn(
                  "prose prose-xs max-w-none text-sm",
                  message.sender === "user"
                    ? "prose-invert"
                    : "prose-gray dark:prose-invert"
                )}
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(message.content),
                }}
              />
              <div
                className={cn(
                  "text-xs mt-2 opacity-70",
                  message.sender === "user"
                    ? "text-green-100"
                    : "text-muted-foreground dark:text-gray-400"
                )}
              >
                {message.timestamp instanceof Date
                  ? message.timestamp.toISOString().slice(11, 19) // HH:mm:ss in UTC
                  : new Date(message.timestamp).toISOString().slice(11, 19)}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-lg shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg"
      >
        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about AI tools and resources..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-foreground dark:text-white zeno-placeholder focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 transition-colors text-sm"
            ref={inputRef}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

// Demo component with streaming AI integration
export function ChatPanelDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI assistant for the Zeno Knowledge Hub. I can help you find the perfect AI tools and resources for your needs. What would you like to work on today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { trackChatQuery, trackChatResponse } = useAnalytics();

  const handleSend = async (message: string) => {
    // Track the user query
    trackChatQuery(message);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Create a placeholder message for streaming
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      content: "",
      sender: "assistant",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      // Call the chat API with streaming
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: message,
          streaming: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullResponse += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        }
      }

      // Track the complete AI response
      trackChatResponse(fullResponse);
    } catch (error) {
      console.error("Error getting AI response:", error);

      const errorMessage =
        "I'm sorry, I'm experiencing some technical difficulties. Please try again later or browse our tool library directly.";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, content: errorMessage } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatPanel messages={messages} onSend={handleSend} isLoading={isLoading} />
  );
}
