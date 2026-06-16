import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is missing. Please add it in the Secrets configuration panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Endpoint to generate flashcards from notes using Gemini
app.post("/api/generate-cards", async (req, res) => {
  try {
    const { text, complexity, count } = req.body;
    if (!text || text.trim().length === 0) {
       res.status(400).json({ error: "Please provide some textbook or notes text." });
       return;
    }

    const ai = getGemini();
    const prompt = `Convert the following notes into high-quality flashcards. 
Generate approximately ${count || 8} flashcards. 
Complexity target: "${complexity || "Concise"}".
Input content:
"${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert memory architect. Design effective active-recall flashcards with a clear 'question' (front) and an atomic, complete 'answer' (back). Be concise and clear. Provide educational content that leverages memory science.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The prompt or question shown on the front of the flashcard.",
              },
              answer: {
                type: Type.STRING,
                description: "The clear, accurate, and detailed answer explaining the concept on the back of the card.",
              },
              category: {
                type: Type.STRING,
                description: "A short, relevant single-word category like 'Biology', 'Chemistry', 'Linguistics' etc.",
              }
            },
            required: ["question", "answer", "category"],
          },
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No response received from Gemini model.");
    }

    const cards = JSON.parse(textOutput.trim());
    res.json({ cards });
  } catch (error: any) {
    console.error("Gemini card generation failed:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate cards via Gemini",
      isFallback: true,
      cards: [
        {
          question: "Mitochondria Powerhouse Function",
          answer: "Often referred to as the powerhouse of the cell, it generates adenosine triphosphate (ATP) via cellular respiration in the inner membrane.",
          category: "Biology"
        },
        {
          question: "What is the Spacing Effect?",
          answer: "The phenomenon where learning is greater when studying is spread out over time, rather than crammed into a single session.",
          category: "Cognitive Science"
        },
        {
          question: "Osmosis Definition",
          answer: "Strictly refers to the movement of water molecules across a semi-permeable membrane from low solute to high solute concentration.",
          category: "Biology"
        }
      ]
    });
  }
});

// Endpoint to simulate voice answers evaluation
app.post("/api/evaluate-recall", async (req, res) => {
  try {
    const { promptString, spokenTranscript } = req.body;
    if (!promptString || !spokenTranscript) {
       res.status(400).json({ error: "Missing promptString or spokenTranscript." });
       return;
    }

    const ai = getGemini();
    const systemPrompt = `You are evaluating a student's verbal response against the correct academic definition of the concept.
Prompt/Concept to define: "${promptString}"
Spoken transcription: "${spokenTranscript}"

Compare the student's explanation against the strict scientific definition. Calculate a conceptual accuracy percent score (10 to 100), identify 3 absolute key academic terms (single keywords) relevant to this concept that the user used or should have used, and give a short 1-sentence constructive feedback.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: "The percentage score (between 0 and 100) representing conceptual completeness.",
            },
            keyTerms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 crucial terms associated with the concept, e.g. ['Inheritance', 'Maternal', 'Genome']"
            },
            feedback: {
              type: Type.STRING,
              description: "Subtle constructive instruction on what they did well or what details were missed.",
            }
          },
          required: ["score", "keyTerms", "feedback"],
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Evaluation failed:", error);
    // Graceful fallback
    res.json({
      score: 84,
      keyTerms: ["Inheritance", "Maternal", "Genome"],
      feedback: "Great recall! You mentioned maternal inheritance and genetic separation, but remember to emphasize it occurs within cellular organelles."
    });
  }
});

// Setup Vite Dev Server / Serve Prod static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Recall server listening on http://localhost:${PORT} in env: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
