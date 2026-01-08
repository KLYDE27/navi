const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use path.join to look in the same folder as this script (backend/)
const data = JSON.parse(fs.readFileSync(path.join(__dirname, "campus-data.json"), "utf8"));

async function seed() {
  console.log("🌱 Starting seed...");
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

  for (const item of data) {
    const embeddingResult = await model.embedContent(item.text);
    const embedding = embeddingResult.embedding.values;


    const { error } = await supabase
      .from("documents")
      .insert({ 
          content: item.text, 
          embedding: embedding,
          category: item.category 
      });

    if (error) console.error("Error inserting:", item.id, error);
    else console.log("✅ Added:", item.id);

 
  }
}

seed();