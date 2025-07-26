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

async function generateUserFocusedDescription(title, description) {
  if (!description || description.trim().length === 0) {
    return `Use when you need ${title
      .replace("Custom GPT: ", "")
      .toLowerCase()} insights.`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are writing user-focused tool descriptions that explain WHEN and WHY someone would use each tool. Write a brief description (max 8 words) that starts with one of these patterns:
          
- "Use when..." 
- "Useful for..."
- "Designed to..."
- "Perfect for..."
- "Ideal when..."
- "Best for..."

Focus on the USER'S NEED, not what the tool analyzes. Think about the business situation or problem the user is trying to solve.

Examples:
- "Use when targeting Gen Z consumers"
- "Useful for executive decision-making"
- "Perfect for condensing long reports"
- "Ideal when planning TikTok campaigns"
- "Best for cybersecurity strategy planning"`,
        },
        {
          role: "user",
          content: `Title: ${title}\n\nFull Description: ${description}\n\nWrite a user-focused description (max 8 words) that explains when/why to use this:`,
        },
      ],
      max_tokens: 40,
      temperature: 0.3,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Error generating description for ${title}:`, error.message);
    // Fallback: create a user-focused description from the title
    const cleanTitle = title
      .replace("Custom GPT: ", "")
      .replace("GPT", "")
      .trim();
    return `Use when you need ${cleanTitle.toLowerCase()} insights.`;
  }
}

async function updateToUserFocusedDescriptions() {
  try {
    console.log("🎯 Generating user-focused descriptions...");

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

        const userFocusedDescription = await generateUserFocusedDescription(
          tool.title,
          tool.description
        );

        // Update shortDescription
        tools[globalIndex].shortDescription = userFocusedDescription;

        console.log(`    ✅ "${userFocusedDescription}"`);
        return userFocusedDescription;
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
    console.log("\n💾 Updating Redis with user-focused descriptions...");
    const updatedConfig = { ...dataConfig, tools };
    await redis.set("data-config", updatedConfig);

    console.log(`\n🎉 Successfully updated ${processed} tools!`);
    console.log("✅ All tools now have user-focused shortDescription field");

    // Show some examples
    console.log("\n📝 New user-focused short descriptions:");
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
  updateToUserFocusedDescriptions()
    .then(() => {
      console.log("🏁 Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Script failed:", error);
      process.exit(1);
    });
}

module.exports = {
  generateUserFocusedDescription,
  updateToUserFocusedDescriptions,
};
