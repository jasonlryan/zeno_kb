const { Redis } = require("@upstash/redis");
const OpenAI = require("openai");
require("dotenv").config({ path: "../.env.local" });

// Initialize Redis and OpenAI clients
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

async function generateBetterDescription(title, description) {
  if (!description || description.trim().length === 0) {
    return `Provides insights and analysis for ${title
      .replace("Custom GPT: ", "")
      .toLowerCase()}.`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are writing factual, descriptive tool descriptions. Write a simple, clear description (max 10 words) that explains what the tool does. Be specific and factual. Avoid marketing language like "unlock", "transform", "uncover", "revolutionary", "powerful", "enhance", "boost", "elevate", "drive". Just describe what it does in plain language.

Examples:
- "Analyzes Gen Z consumer behavior and purchasing patterns"
- "Provides CEO decision-making insights and leadership trends"  
- "Creates concise summaries from lengthy documents"
- "Tracks TikTok trends and viral content patterns"`,
        },
        {
          role: "user",
          content: `Title: ${title}\n\nFull Description: ${description}\n\nWrite a factual description (max 10 words) of what this tool does:`,
        },
      ],
      max_tokens: 40,
      temperature: 0.3,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Error generating description for ${title}:`, error.message);
    // Fallback: create a simple description from the title
    const cleanTitle = title
      .replace("Custom GPT: ", "")
      .replace("GPT", "")
      .trim();
    return `Provides ${cleanTitle.toLowerCase()} insights and analysis.`;
  }
}

async function updateDescriptions() {
  try {
    console.log("🔍 Fetching tools from Redis...");

    // Get all tools from Redis
    const dataConfig = await redis.get("data-config");
    if (!dataConfig || !dataConfig.tools) {
      console.error("❌ No tools found in Redis data-config");
      return;
    }

    const tools = dataConfig.tools;
    console.log(`📊 Found ${tools.length} tools to update`);

    // Process tools in batches to avoid rate limits
    const batchSize = 5;
    let processed = 0;

    for (let i = 0; i < tools.length; i += batchSize) {
      const batch = tools.slice(i, i + batchSize);

      console.log(
        `\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          tools.length / batchSize
        )}...`
      );

      // Process batch in parallel
      const promises = batch.map(async (tool, index) => {
        const globalIndex = i + index;
        console.log(`  ${globalIndex + 1}/${tools.length}: ${tool.title}`);

        const betterDescription = await generateBetterDescription(
          tool.title,
          tool.description
        );

        // Update shortDescription
        tools[globalIndex].shortDescription = betterDescription;

        console.log(`    ✅ "${betterDescription}"`);
        return betterDescription;
      });

      await Promise.all(promises);
      processed += batch.length;

      // Small delay between batches
      if (i + batchSize < tools.length) {
        console.log("    ⏱️  Waiting 2 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Update Redis with the modified data
    console.log("\n💾 Updating Redis with better descriptions...");
    const updatedConfig = { ...dataConfig, tools };
    await redis.set("data-config", updatedConfig);

    console.log(`\n🎉 Successfully updated ${processed} tools!`);
    console.log(
      "✅ All tools now have better, more descriptive shortDescription field"
    );

    // Show some examples
    console.log("\n📝 New descriptive short descriptions:");
    tools.slice(0, 8).forEach((tool, i) => {
      console.log(`  ${i + 1}. ${tool.title}`);
      console.log(`     New: "${tool.shortDescription}"`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error updating descriptions:", error);
  }
}

// Run the script
if (require.main === module) {
  updateDescriptions()
    .then(() => {
      console.log("🏁 Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Script failed:", error);
      process.exit(1);
    });
}

module.exports = { generateBetterDescription, updateDescriptions };
