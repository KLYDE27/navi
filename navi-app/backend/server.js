const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

const POWER_AUTOMATE_URL = "https://defaultc7e8b5ac96c64123a65a793543aced.4d.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/9719263443f443b3ad014eba2dfde60e/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=RV_ZZNiClj0JK1VW-6tRpQdIeDD_sLP7HQBzEX6MghQ" // 👈 PASTE YOUR LONG URL HERE

// --- CONFIGURATION ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.post("/api/chat", async (req, res) => {
  // Define these variables OUTSIDE the try block so they exist if an error happens
  let userMessage = ""; 
  let filterCategory = "General"; 

  try {
    // 1. Get the message from the frontend
    userMessage = req.body.userMessage;

    // 2. PARSE CONTEXT: Extract the [Context: ...] tag
    // The frontend sends: "[Context: College of Engineering] Where is the dean?"
    // We need to split that into "College of Engineering" and "Where is the dean?"
    let cleanMessage = userMessage;
    const contextMatch = userMessage.match(/\[Context: (.*?)\]/);
    
    if (contextMatch) {
      filterCategory = contextMatch[1]; // e.g., "College of Engineering"
      // Remove the tag from the message so the AI doesn't get confused
      cleanMessage = userMessage.replace(contextMatch[0], "").trim();
    }

    console.log(`🔒 Search Mode: Category='${filterCategory}', Query='${cleanMessage}'`);

    // 3. EMBED: Convert the CLEAN message to numbers
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embeddingResult = await embeddingModel.embedContent(cleanMessage);
    const userVector = embeddingResult.embedding.values;

    // 4. RETRIEVE: Search Supabase (WITH THE NEW FILTER)
    // ⚠️ THIS WAS THE CAUSE OF YOUR SUPABASE ERROR
    const { data: documents, error } = await supabase.rpc("match_documents", {
      query_embedding: userVector,
      match_threshold: 0.2, 
      match_count: 3,
      filter_category: filterCategory // 👈 This is the required 4th parameter!
    });

    if (error) {
      console.error("Supabase Query Error:", error);
      throw error;
    }

    // Combine results
    const contextText = documents.map(doc => doc.content).join("\n\n");
    console.log(`✅ Found ${documents.length} matches.`);

    // 5. GENERATE: Ask Gemini
    const chatModel = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `
        You are Navi, the AI Campus Navigator for PUP.
        
        CURRENT CONTEXT: You are currently assisting a student from the "${filterCategory}".
        If they ask about a location, assume they mean within this college unless specified otherwise.
        
        Strictly answer based ONLY on the provided Context.
        If the Context is empty, say: "I don't have information on that specific topic for ${filterCategory}."
      `
    });

    const prompt = `Context:\n${contextText}\n\nQuestion: ${cleanMessage}`;
    
    const result = await chatModel.generateContent(prompt);
    const response = await result.response;
    
    res.json({ reply: response.text() });

  } catch (error) {
    console.error("Server Error:", error);
    // Now this won't crash because 'userMessage' is defined at the top
    res.status(500).json({ error: "Navi failed to process request" });
  }
});
// --- COMMUNITY & ADMIN API ---

// 1. PUBLIC GET: Only fetch 'approved' FAQs for students
app.get("/api/faqs/public", async (req, res) => {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 2. ADMIN GET: Fetch ALL FAQs
app.get("/api/faqs/admin", async (req, res) => {
  console.log("⚡ Admin fetching all FAQs...");
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Admin Fetch Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  
  console.log(`✅ Admin found ${data.length} items`);
  res.json(data);
});

// 3. POST: Submit a new FAQ
app.post("/api/faqs", async (req, res) => {
  console.log("📩 Receiving new FAQ submission:", req.body);
  
  const { category, question, answer, submitted_by } = req.body;
  const { error } = await supabase
    .from("faqs")
    .insert([{ 
      category, 
      question, 
      answer, 
      submitted_by: submitted_by || "Student",
      status: 'pending' 
    }]);

  if (error) {
    console.error("❌ Post Error:", error.message);
    return res.status(500).json({ error: error.message });
  }

  console.log("✅ FAQ Saved to Database!");
  res.json({ success: true });
});

// 4. PUT: Update Status
app.put("/api/faqs/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  console.log(`🔄 Updating ID ${id} to ${status}`);

  const { error } = await supabase
    .from("faqs")
    .update({ status })
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.listen(3000, () => console.log("✅ NAVI (Strict Mode) running on port 3000"));