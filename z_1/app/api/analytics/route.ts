import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redisConfigManager";

// Analytics event types
type AnalyticsEvent = {
  type: "chat_query" | "chat_response" | "tool_view" | "tool_favorite";
  timestamp: number;
  data: {
    query?: string;
    response?: string;
    toolId?: string;
    toolTitle?: string;
    userId?: string;
    sessionId?: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    const event: AnalyticsEvent = await request.json();
    
    // Validate event structure
    if (!event.type || !event.timestamp || !event.data) {
      return NextResponse.json(
        { error: "Invalid event structure" },
        { status: 400 }
      );
    }

    // Store event in Redis with timestamp-based key
    const eventKey = `analytics:event:${event.timestamp}:${Math.random().toString(36).substr(2, 9)}`;
    await redis.hset(eventKey, {
      type: event.type,
      timestamp: event.timestamp,
      data: JSON.stringify(event.data),
    });

    // Add to sorted sets for efficient querying
    await redis.zadd(`analytics:events:${event.type}`, event.timestamp, eventKey);
    await redis.zadd("analytics:events:all", event.timestamp, eventKey);

    // Update counters for quick stats
    const today = new Date().toISOString().split('T')[0];
    await redis.incr(`analytics:daily:${event.type}:${today}`);
    await redis.incr(`analytics:total:${event.type}`);

    // Tool-specific counters
    if (event.type === "tool_view" && event.data.toolId) {
      await redis.incr(`analytics:tool:views:${event.data.toolId}`);
    }
    if (event.type === "tool_favorite" && event.data.toolId) {
      await redis.incr(`analytics:tool:favorites:${event.data.toolId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const format = searchParams.get("format") || "json";

    if (action === "report") {
      // Generate analytics report
      const report = await generateAnalyticsReport();
      
      if (format === "csv") {
        const csv = convertReportToCSV(report);
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=analytics-report.csv",
          },
        });
      }
      
      return NextResponse.json(report);
    }

    if (action === "dashboard") {
      // Get dashboard data
      const dashboardData = await getDashboardData();
      return NextResponse.json(dashboardData);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Analytics report error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

async function generateAnalyticsReport() {
  const [
    totalQueries,
    totalResponses,
    totalToolViews,
    totalFavorites,
    recentEvents,
    topTools,
  ] = await Promise.all([
    redis.get("analytics:total:chat_query") || "0",
    redis.get("analytics:total:chat_response") || "0", 
    redis.get("analytics:total:tool_view") || "0",
    redis.get("analytics:total:tool_favorite") || "0",
    getRecentEvents(100),
    getTopTools(),
  ]);

  return {
    summary: {
      totalQueries: parseInt(totalQueries),
      totalResponses: parseInt(totalResponses),
      totalToolViews: parseInt(totalToolViews),
      totalFavorites: parseInt(totalFavorites),
    },
    recentEvents,
    topTools,
    generatedAt: new Date().toISOString(),
  };
}

async function getDashboardData() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [
    todayQueries,
    yesterdayQueries,
    todayViews,
    yesterdayViews,
    topTools,
    recentQueries,
  ] = await Promise.all([
    redis.get(`analytics:daily:chat_query:${today}`) || "0",
    redis.get(`analytics:daily:chat_query:${yesterday}`) || "0",
    redis.get(`analytics:daily:tool_view:${today}`) || "0",
    redis.get(`analytics:daily:tool_view:${yesterday}`) || "0",
    getTopTools(10),
    getRecentChatQueries(20),
  ]);

  return {
    dailyStats: {
      today: {
        queries: parseInt(todayQueries),
        views: parseInt(todayViews),
      },
      yesterday: {
        queries: parseInt(yesterdayQueries),
        views: parseInt(yesterdayViews),
      },
    },
    topTools,
    recentQueries,
  };
}

async function getRecentEvents(limit: number = 50) {
  const eventKeys = await redis.zrevrange("analytics:events:all", 0, limit - 1);
  const events = [];

  for (const key of eventKeys) {
    const event = await redis.hgetall(key);
    if (event.type) {
      events.push({
        type: event.type,
        timestamp: parseInt(event.timestamp),
        data: JSON.parse(event.data || "{}"),
      });
    }
  }

  return events;
}

async function getTopTools(limit: number = 20) {
  const toolKeys = await redis.keys("analytics:tool:views:*");
  const tools = [];

  for (const key of toolKeys) {
    const toolId = key.replace("analytics:tool:views:", "");
    const [views, favorites] = await Promise.all([
      redis.get(key) || "0",
      redis.get(`analytics:tool:favorites:${toolId}`) || "0",
    ]);

    tools.push({
      toolId,
      views: parseInt(views),
      favorites: parseInt(favorites),
    });
  }

  return tools.sort((a, b) => b.views - a.views).slice(0, limit);
}

async function getRecentChatQueries(limit: number = 20) {
  const queryKeys = await redis.zrevrange("analytics:events:chat_query", 0, limit - 1);
  const queries = [];

  for (const key of queryKeys) {
    const event = await redis.hgetall(key);
    if (event.data) {
      const data = JSON.parse(event.data);
      queries.push({
        query: data.query,
        timestamp: parseInt(event.timestamp),
        userId: data.userId,
      });
    }
  }

  return queries;
}

function convertReportToCSV(report: any): string {
  const lines = [
    "Report Type,Value",
    `Total Queries,${report.summary.totalQueries}`,
    `Total Responses,${report.summary.totalResponses}`,
    `Total Tool Views,${report.summary.totalToolViews}`,
    `Total Favorites,${report.summary.totalFavorites}`,
    "",
    "Top Tools",
    "Tool ID,Views,Favorites",
    ...report.topTools.map((tool: any) => `${tool.toolId},${tool.views},${tool.favorites}`),
    "",
    "Recent Events",
    "Type,Timestamp,Data",
    ...report.recentEvents.map((event: any) => 
      `${event.type},${new Date(event.timestamp).toISOString()},${JSON.stringify(event.data).replace(/,/g, ';')}`
    ),
  ];

  return lines.join("\n");
} 