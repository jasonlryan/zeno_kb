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
    
    // Use hset to store the event data
    await redis.hset(eventKey, {
      type: event.type,
      timestamp: event.timestamp.toString(),
      data: JSON.stringify(event.data),
    });

    // Add to sorted sets for efficient querying (using correct zadd syntax)
    await redis.zadd(`analytics:events:${event.type}`, { score: event.timestamp, member: eventKey });
    await redis.zadd("analytics:events:all", { score: event.timestamp, member: eventKey });

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
  try {
    const [
      totalQueries,
      totalResponses,
      totalToolViews,
      totalFavorites,
      recentEvents,
      topTools,
    ] = await Promise.all([
      redis.get("analytics:total:chat_query"),
      redis.get("analytics:total:chat_response"), 
      redis.get("analytics:total:tool_view"),
      redis.get("analytics:total:tool_favorite"),
      getRecentEvents(100),
      getTopTools(),
    ]);

    return {
      summary: {
        totalQueries: parseInt(String(totalQueries || "0")),
        totalResponses: parseInt(String(totalResponses || "0")),
        totalToolViews: parseInt(String(totalToolViews || "0")),
        totalFavorites: parseInt(String(totalFavorites || "0")),
      },
      recentEvents,
      topTools,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error generating analytics report:", error);
    return {
      summary: { totalQueries: 0, totalResponses: 0, totalToolViews: 0, totalFavorites: 0 },
      recentEvents: [],
      topTools: [],
      generatedAt: new Date().toISOString(),
    };
  }
}

async function getDashboardData() {
  try {
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
      redis.get(`analytics:daily:chat_query:${today}`),
      redis.get(`analytics:daily:chat_query:${yesterday}`),
      redis.get(`analytics:daily:tool_view:${today}`),
      redis.get(`analytics:daily:tool_view:${yesterday}`),
      getTopTools(10),
      getRecentChatQueries(20),
    ]);

    return {
      dailyStats: {
        today: {
          queries: parseInt(String(todayQueries || "0")),
          views: parseInt(String(todayViews || "0")),
        },
        yesterday: {
          queries: parseInt(String(yesterdayQueries || "0")),
          views: parseInt(String(yesterdayViews || "0")),
        },
      },
      topTools,
      recentQueries,
    };
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    return {
      dailyStats: {
        today: { queries: 0, views: 0 },
        yesterday: { queries: 0, views: 0 },
      },
      topTools: [],
      recentQueries: [],
    };
  }
}

async function getRecentEvents(limit: number = 50) {
  try {
    // Use zrange with rev option to get most recent events
    const eventKeys = await redis.zrange("analytics:events:all", 0, limit - 1, { rev: true }) as string[];
    const events = [];

    for (const key of eventKeys) {
      try {
        const event = await redis.hgetall(key);
        if (event && typeof event === 'object' && 'type' in event && typeof event.data === 'string') {
          events.push({
            type: String(event.type),
            timestamp: parseInt(String(event.timestamp)),
            data: JSON.parse(event.data || "{}"),
          });
        }
      } catch (err) {
        console.error(`Error processing event ${key}:`, err);
      }
    }

    return events;
  } catch (error) {
    console.error("Error getting recent events:", error);
    return [];
  }
}

async function getTopTools(limit: number = 20) {
  try {
    const toolKeys = await redis.keys("analytics:tool:views:*") as string[];
    const tools = [];

    for (const key of toolKeys) {
      try {
        const toolId = key.replace("analytics:tool:views:", "");
        const [views, favorites] = await Promise.all([
          redis.get(key),
          redis.get(`analytics:tool:favorites:${toolId}`),
        ]);

        tools.push({
          toolId,
          views: parseInt(String(views || "0")),
          favorites: parseInt(String(favorites || "0")),
        });
      } catch (err) {
        console.error(`Error processing tool ${key}:`, err);
      }
    }

    return tools.sort((a, b) => b.views - a.views).slice(0, limit);
  } catch (error) {
    console.error("Error getting top tools:", error);
    return [];
  }
}

async function getRecentChatQueries(limit: number = 20) {
  try {
    const queryKeys = await redis.zrange("analytics:events:chat_query", 0, limit - 1, { rev: true }) as string[];
    const queries = [];

    for (const key of queryKeys) {
      try {
        const event = await redis.hgetall(key);
        if (event && typeof event === 'object' && 'data' in event) {
          let data;
          // Handle both string and object data formats
          if (typeof event.data === 'string') {
            try {
              data = JSON.parse(event.data);
            } catch {
              continue;
            }
          } else if (typeof event.data === 'object') {
            data = event.data;
          } else {
            continue;
          }
          
          queries.push({
            query: data.query,
            timestamp: parseInt(String(event.timestamp)),
            userId: data.userId,
          });
        }
      } catch (err) {
        console.error(`Error processing query ${key}:`, err);
      }
    }

    return queries;
  } catch (error) {
    console.error("Error getting recent chat queries:", error);
    return [];
  }
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