import fs from 'fs';

async function fetchWithRetry(url: string, options: RequestInit, retries = 5, delay = 3000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options);
    if (response.ok) return response;
    
    const errorText = await response.text();
    console.warn(`⚠️ NVIDIA API Status ${response.status}: ${errorText}. Retrying (${i + 1}/${retries})...`);
    
    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
      continue;
    }
    throw new Error(`NVIDIA API Error: ${response.status} - ${errorText}`);
  }
  throw new Error("Max retries exceeded for NVIDIA API");
}

async function generate() {
  console.log("🧠 ⚡ CONNECTING TO UNLIMITED NVIDIA NEMOTRON INFRASTRUCTURE...");
  const url = "https://integrate.api.nvidia.com/v1/chat/completions";
  const apiKey = process.env.NVIDIA_API_KEY || "";

  // Using NVIDIA's ultra-powerful active Nemotron model
  const payload = {
    model: "nvidia/nemotron-4-340b-instruct",
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
    let jsonContent = data.choices[0].message.content.trim();
    
    jsonContent = jsonContent.replace(/```json/g, '').replace(/```/g, '').trim();
    
    if (!fs.existsSync('src/data')) fs.mkdirSync('src/data', { recursive: true });
    fs.writeFileSync('src/data/videoConfig.json', jsonContent);
    console.log("🎉 Success! Config generated via NVIDIA Nemotron and saved to src/data/videoConfig.json");

  } catch (error) {
    console.error("❌ NVIDIA Generation failed:", error);
    process.exit(1);
  }
}

generate();