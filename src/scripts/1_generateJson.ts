import fs from 'fs';

async function generate() {
  console.log("🧠 🚨 INITIATING NVIDIA SUPERCOMPUTER AI ENGINE 🚨 🧠");
  const url = "https://integrate.api.nvidia.com/v1/chat/completions";
  
  // Replace with actual Nvidia key before running
  const apiKey = process.env.NVIDIA_API_KEY || "nvapi-TERI_NVIDIA_KEY_YAHAN_DAAL";

  const payload = {
    model: "meta/llama-3.1-405b-instruct",
    messages: [
      { role: "system", content: "You are an autonomous JSON script generator for a Procedural WebGL 3D engine. Output STRICT JSON only. Do not add markdown." },
      { role: "user", content: "Generate a 3-scene video script about Data & AI. Provide output strictly matching this JSON schema: { title: string, theme: 'cyber'|'technology'|'science'|'finance', durationInFrames: number, fps: number, camera: { type: string, speed: number, distance: number, fov: number }, lighting: { keyIntensity: number, fillIntensity: number, rimIntensity: number, colorTheme: string }, particles: { count: number, speed: number, color: string, shape: string }, seoTags: string[] }. CRITICAL: durationInFrames MUST be strictly between 900 and 1500." }
    ],
    response_format: { type: "json_object" },
    max_tokens: 2048
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`NVIDIA API Error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    const jsonContent = data.choices[0].message.content;
    
    if (!fs.existsSync('data')) fs.mkdirSync('data');
    if (!fs.existsSync('out')) fs.mkdirSync('out');
    
    fs.writeFileSync('data/sceneData.json', jsonContent);
    console.log("✅ JSON generated successfully via NVIDIA 405B!");

  } catch (error) {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  }
}

generate();