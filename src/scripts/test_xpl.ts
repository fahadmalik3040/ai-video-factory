import OpenAI from 'openai';

async function testExperientialGateway() {
  const apiKey = process.env.EXPLABS_API_KEY || "xpl_70bd1f22c9937297265c1682e573fbcb7df0d74f";
  
  if (!apiKey) {
    console.error("❌ EXPLABS_API_KEY environment variable is missing.");
    console.error("Please create one under Settings -> API keys and export it.");
    process.exit(1);
  }

  const openai = new OpenAI({
    baseURL: "https://api.experientiallabs.ai/v1",
    apiKey: apiKey,
  });

  console.log("🚀 Firing test call to Experiential Labs (claude-fable-5.1)...");

  try {
    const response = await openai.chat.completions.create({
      model: "claude-fable-5.1",
      messages: [{ role: "user", content: "Reply with 'API is working' and nothing else." }]
    });

    console.log("✅ Reply:", response.choices[0].message.content);
    console.log("📊 Token Usage:", response.usage);
  } catch (error) {
    console.error("❌ API Error:", error);
  }
}

testExperientialGateway();
