import { useCallback } from 'react';

type AnalyticsEvent = {
  type: "chat_query" | "chat_response" | "tool_view" | "tool_favorite";
  data: {
    query?: string;
    response?: string;
    toolId?: string;
    toolTitle?: string;
    userId?: string;
    sessionId?: string;
  };
};

export function useAnalytics() {
  const trackEvent = useCallback(async (event: Omit<AnalyticsEvent, 'timestamp'>) => {
    try {
      const analyticsEvent = {
        ...event,
        timestamp: Date.now(),
      };

      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsEvent),
      });
      
      if (!response.ok) {
        console.error('Analytics request failed:', response.status);
      }
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }, []);

  const trackChatQuery = useCallback((query: string, userId?: string) => {
    trackEvent({
      type: 'chat_query',
      data: { query, userId, sessionId: getSessionId() },
    });
  }, [trackEvent]);

  const trackChatResponse = useCallback((response: string, userId?: string) => {
    trackEvent({
      type: 'chat_response',
      data: { response, userId, sessionId: getSessionId() },
    });
  }, [trackEvent]);

  const trackToolView = useCallback((toolId: string, toolTitle?: string, userId?: string) => {
    trackEvent({
      type: 'tool_view',
      data: { toolId, toolTitle, userId, sessionId: getSessionId() },
    });
  }, [trackEvent]);

  const trackToolFavorite = useCallback((toolId: string, toolTitle?: string, userId?: string) => {
    trackEvent({
      type: 'tool_favorite',
      data: { toolId, toolTitle, userId, sessionId: getSessionId() },
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackChatQuery,
    trackChatResponse,
    trackToolView,
    trackToolFavorite,
  };
}

// Simple session ID generator
function getSessionId(): string {
  // Check if we're in browser environment
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
  
  let sessionId = sessionStorage.getItem('analytics-session-id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    sessionStorage.setItem('analytics-session-id', sessionId);
  }
  return sessionId;
} 