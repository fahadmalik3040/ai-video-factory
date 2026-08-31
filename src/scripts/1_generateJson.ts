import fs from 'fs';

async function fetchWithRetry(url: string, options: RequestInit, retries = 4, delay = 4000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options);
    if (response.ok) return response;
    
    const errorText = await response.text();
    if (response.status === 503 && i < retries - 1) {
      console.warn(`⚠️ API overloaded (503). Retrying in ${delay / 1000}s (Attempt ${i + 1}/${retries})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
      continue;
    }
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
  throw new Error("Max retries exceeded for API");
}

async function generate() {
  console.log("🧠 GENERATING VIDEO CONFIG & 50 SEO TAGS...");
  const url = "https://integrate.api.nvidia.com/v1/chat/completions";
  const apiKey = process.env.NVIDIA_API_KEY || "";

  const payload = {
    model: "meta/llama-3.1-70b-instruct",
    messages: [
      { 
        role: "system", 
        content: "You are an elite stock footage metadata and 3D visual director. Output STRICT JSON only with keys: title (string), theme (string), colorTheme (hex string), seoTags (array of exactly 50 high-demand stock video tags)." 
      },
      { 
        role: "user", 
        content: "Generate an ultra-demanding stock video config with 50 comma-separated SEO tags for Adobe Stock and Shutterstock." 
      }
    ],
    response_format: { type: "json_object" }
  };

  try {
    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const jsonContent = data.choices[0].message.content;
    
    if (!fs.existsSync('src/data')) fs.mkdirSync('src/data', { recursive: true });
    fs.writeFileSync('src/data/videoConfig.json', jsonContent);
    console.log("🎉 Video config with SEO tags saved to src/data/videoConfig.json");

  } catch (error) {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  }
}

generate();