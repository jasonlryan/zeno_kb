import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { stringify } from "csv-stringify/sync";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";

    // Get tools data from Redis
    const dataConfig = await redis.get("data-config") as any;
    if (!dataConfig || !dataConfig.tools) {
      return NextResponse.json(
        { error: "No tools data found" },
        { status: 404 }
      );
    }

    const tools = dataConfig.tools;

    if (format === "json") {
      // Return JSON format
      const response = NextResponse.json({
        timestamp: new Date().toISOString(),
        total_tools: tools.length,
        tools: tools,
      });

      // Set headers for file download
      response.headers.set(
        "Content-Disposition",
        `attachment; filename="zeno-tools-${new Date().toISOString().split('T')[0]}.json"`
      );
      response.headers.set("Content-Type", "application/json");

      return response;
    } else {
      // Return CSV format
      const csvData = tools.map((tool: any) => ({
        id: tool.id || "",
        title: tool.title || "",
        description: tool.description || "",
        shortDescription: tool.shortDescription || "",
        url: tool.url || "",
        type: tool.type || "",
        tier: tool.tier || "",
        complexity: tool.complexity || "",
        tags: Array.isArray(tool.tags) ? tool.tags.join("; ") : (tool.tags || ""),
        function: tool.function || "",
        featured: tool.featured ? "true" : "false",
        date_added: tool.date_added || "",
        added_by: tool.added_by || "",
        category: tool.category || "",
        date_created: tool.date_created || "",
        date_modified: tool.date_modified || "",
      }));

      const csvContent = stringify(csvData, { header: true });

      // Create response with CSV content
      const response = new NextResponse(csvContent);

      // Set headers for file download
      response.headers.set(
        "Content-Disposition",
        `attachment; filename="zeno-tools-${new Date().toISOString().split('T')[0]}.csv"`
      );
      response.headers.set("Content-Type", "text/csv");

      return response;
    }
  } catch (error) {
    console.error("Export tools error:", error);
    return NextResponse.json(
      { error: "Failed to export tools data" },
      { status: 500 }
    );
  }
} 