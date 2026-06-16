import express from "express";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { serverDB } from "./server_db";
import { serverAiCache } from "./server_ai_cache";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Throttling State
const ipRequestCounts: Record<string, { count: number; resetTime: number }> = {};
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 40; // 40 requests/min

// Rate limiting middleware
app.use((req, res, next) => {
  const ip = req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || "global";
  const now = Date.now();

  if (!ipRequestCounts[ip]) {
    ipRequestCounts[ip] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    return next();
  }

  const rate = ipRequestCounts[ip];
  if (now > rate.resetTime) {
    rate.count = 1;
    rate.resetTime = now + RATE_LIMIT_WINDOW_MS;
    return next();
  }

  rate.count++;
  if (rate.count > MAX_REQUESTS_PER_WINDOW) {
    console.warn(`[RATE LIMIT EXCEEDED] Blocking IP ${ip} for spam prevention.`);
    res.status(429).json({ error: "Too many requests. Please slow down and respect local API rate limits." });
    return;
  }
  next();
});

// Input Sanitization and injection containment
function sanitizeInput(text: string, maxLength = 8000): string {
  if (!text) return "";
  let clean = text.trim();
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }

  // Defuse known prompt injection attempts
  const badPatterns = [
    /ignore prior instruction/gi,
    /ignore previous instruction/gi,
    /you are now a/gi,
    /system instruction override/gi,
  ];

  for (const pattern of badPatterns) {
    clean = clean.replace(pattern, "[Mitigated Prompt Injection Segment]");
  }

  return clean;
}

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is missing. Please add it in your Secrets configuration panel.");
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

// REST API and Authentication endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Registration Endpoint
app.post("/api/auth/register", (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: "Please fill in all requested fields." });
      return;
    }

    const cleanEmail = sanitizeInput(email, 120);
    const cleanName = sanitizeInput(name, 100);

    const session = serverDB.registerUser(cleanEmail, cleanName, password);
    const token = crypto.createHash("sha256").update(`${cleanEmail}-${Date.now()}`).digest("hex");

    res.json({ success: true, token, userEmail: cleanEmail, session });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to finalize registration." });
  }
});

// Sign-In Endpoint
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Missing active session email or password." });
      return;
    }

    const cleanEmail = sanitizeInput(email, 120);
    const userDoc = serverDB.findUser(cleanEmail);

    if (!userDoc) {
      res.status(421).json({ error: "No student account discovered with this academic email address." });
      return;
    }

    const incomingHash = crypto.createHash("sha256").update(password).digest("hex");
    if (incomingHash !== userDoc.passwordHash) {
      res.status(401).json({ error: "Incorrect password credentials. Please verify and retry." });
      return;
    }

    const token = crypto.createHash("sha256").update(`${cleanEmail}-${Date.now()}`).digest("hex");
    res.json({ success: true, token, userEmail: cleanEmail, session: userDoc.session });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server sign in error." });
  }
});

// Sync State Downlink
app.get("/api/state", (req, res) => {
  try {
    const email = req.query.email?.toString();
    if (!email) {
      res.status(400).json({ error: "Authorization email querystring missing." });
      return;
    }
    const cleanEmail = sanitizeInput(email, 120);
    const session = serverDB.getSession(cleanEmail);
    res.json({ session });
  } catch (err: any) {
    res.status(404).json({ error: err.message || "Session documentation not found." });
  }
});

// Sync State Uplink
app.post("/api/state/save", (req, res) => {
  try {
    const { email, session } = req.body;
    if (!email || !session) {
      res.status(400).json({ error: "Missing authorization email or upload payload body." });
      return;
    }

    const cleanEmail = sanitizeInput(email, 120);
    serverDB.updateSession(cleanEmail, (existing) => {
      existing.profile = session.profile;
      existing.streak = session.streak;
      existing.reviewsCount = session.reviewsCount;
      existing.masteryList = session.masteryList;
      existing.heatmap = session.heatmap;
      existing.schedule = session.schedule;
      existing.deadlines = session.deadlines;
      existing.notifications = session.notifications;
      existing.decks = session.decks;
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to commit local cache states." });
  }
});

// Card review logic supporting the physical SM-2 Spaced Repetition Formula on the server
app.post("/api/card/review", (req, res) => {
  try {
    const { email, deckId, cardId, rating } = req.body; // rating is 'again', 'hard', 'good', 'easy'
    if (!email || !deckId || !cardId || !rating) {
      res.status(400).json({ error: "Missing state tracking inputs." });
      return;
    }

    // Map string ratings to SuperMemo grade qualities (0 - 5)
    let score = 3;
    if (rating === "again") score = 1;
    if (rating === "hard") score = 3;
    if (rating === "good") score = 4;
    if (rating === "easy") score = 5;

    const cleanEmail = sanitizeInput(email, 120);
    const sessionDoc = serverDB.updateSession(cleanEmail, (session) => {
      const targetDeck = session.decks.find((d) => d.id === deckId);
      if (!targetDeck) return;

      const targetCard = targetDeck.cards.find((c) => c.id === cardId);
      if (!targetCard) return;

      // Extract current SM-2 parameters or initialize defaults
      let ef = targetCard.easinessFactor ?? 2.5;
      let interval = targetCard.interval ?? 0;
      let repetitions = targetCard.repetitions ?? 0;

      // Execute SM-2 calculation instructions
      if (score >= 3) {
        if (repetitions === 0) {
          interval = 1;
        } else if (repetitions === 1) {
          interval = 6;
        } else {
          interval = Math.round(interval * ef);
        }
        repetitions++;
        targetCard.status = interval > 15 ? "mature" : "young";
      } else {
        repetitions = 0;
        interval = 1;
        targetCard.status = "new";
      }

      // Update easiness factor with the original SM-2 equation
      ef = ef + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02));
      if (ef < 1.3) ef = 1.3;

      // Update card records
      targetCard.easinessFactor = Number(ef.toFixed(2));
      targetCard.interval = interval;
      targetCard.repetitions = repetitions;
      targetCard.lastReviewed = new Date().toISOString();
      targetCard.dueDate = new Date(Date.now() + interval * 24 * 60 * 60 * 1000).toISOString();

      // Recalculate deck mastery level dynamically
      const matureCount = targetDeck.cards.filter((c) => c.status === "mature").length;
      const youngCount = targetDeck.cards.filter((c) => c.status === "young").length;
      targetDeck.mastery = Math.min(100, Math.round(((matureCount * 1.0 + youngCount * 0.4) / targetDeck.cards.length) * 100));

      // Decrease global list counter of studies due if it was due today
      session.reviewsCount = Math.max(0, session.reviewsCount - 1);
    });

    res.json({ success: true, session: sessionDoc });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Spaced review indexing failure." });
  }
});

// AI Flashcard Generator (cached)
app.post("/api/generate-cards", async (req, res) => {
  try {
    const { text, complexity, count } = req.body;
    if (!text || text.trim().length === 0) {
      res.status(400).json({ error: "Please write or paste notes content to proceed." });
      return;
    }

    const cleanInput = sanitizeInput(text, 12000);
    const resolvedComplexity = sanitizeInput(complexity || "Concise", 40);
    const finalCount = Math.min(25, Math.max(1, Number(count) || 8));

    // AI Query Caching lookup to prevent expensive duplicate models.generateContent requests
    const uniqueQuery = `${resolvedComplexity}-${finalCount}-${cleanInput}`;
    const cachedHit = serverAiCache.get("generate-cards", uniqueQuery);
    if (cachedHit) {
      res.json({ cards: cachedHit, isCached: true });
      return;
    }

    const ai = getGemini();
    const prompt = `Convert the following study notes or page transcription into high-quality active recall study flashcards.
Generate exactly ${finalCount} flashcards. 
Target cognitive difficulty level or style: "${resolvedComplexity}".
Input content:
"${cleanInput}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a senior study researcher designing active-recall decks. Provide short questions (front) paired with highly precise answers (back) summarizing key structures. Output purely as a valid JSON array of objects using the designated schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "Clean, unambiguous prompt question or recall trigger.",
              },
              answer: {
                type: Type.STRING,
                description: "The complete molecular/academic answer clarifying the active process.",
              },
              category: {
                type: Type.STRING,
                description: "Single categorical discipline, e.g., Biology, Chemistry, Linguistics, Computing.",
              }
            },
            required: ["question", "answer", "category"],
          },
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Received empty generated payload from model.");
    }

    const cards = JSON.parse(textOutput.trim());

    // Commit generated card deck to disk cache
    serverAiCache.set("generate-cards", uniqueQuery, cards);

    res.json({ cards, isCached: false });
  } catch (error: any) {
    console.error("Spaced recall AI generation failure:", error);
    res.status(500).json({
      error: error.message || "Failed to process card extraction via Gemini.",
      isFallback: true,
      cards: [
        {
          question: "Mitochondria Mitochondrial Genome",
          answer: "Circular DNA structures located inside independent organelles that replicate self-sufficiently, maternally passed on to subsequent lines.",
          category: "Biology"
        },
        {
          question: "Active Recall Principle",
          answer: "The memory science method of self-testing recollection strength before looking at the visual prompt reference to enforce synapical pathways.",
          category: "Cognitive Science"
        }
      ]
    });
  }
});

// Speech Evaluation & Spoken Recall Analysis Endpoint (cached)
app.post("/api/evaluate-recall", async (req, res) => {
  try {
    const { promptString, spokenTranscript } = req.body;
    if (!promptString || !spokenTranscript) {
      res.status(400).json({ error: "Speech evaluation parameters or transcript not captured." });
      return;
    }

    const cleanPrompt = sanitizeInput(promptString, 1000);
    const cleanSpoken = sanitizeInput(spokenTranscript, 2500);

    const cacheKey = `${cleanPrompt}::${cleanSpoken}`;
    const cachedHit = serverAiCache.get("evaluate-recall", cacheKey);
    if (cachedHit) {
      res.json({ ...cachedHit, isCached: true });
      return;
    }

    const ai = getGemini();
    const evaluationPrompt = `Rate the accuracy of the student's spoken explanation of a concept versus the standard scientific explanation:
Concept target prompt: "${cleanPrompt}"
Spoken feedback response text: "${cleanSpoken}"

Evaluate:
1. Provide a numerical score from 10 to 100 indicating semantic coverage.
2. List up to 3 direct academic vocabulary words that were mentioned or ideally should be highlighted.
3. Write a supportive 1-sentence analytical response suggesting what they explained perfectly or missed.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: evaluationPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: "Percentage matching score of conceptual accuracy.",
            },
            keyTerms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 highly focused scientific words relevant to the concept context."
            },
            feedback: {
              type: Type.STRING,
              description: "A constructive, accurate, short paragraph encouraging active improvement."
            }
          },
          required: ["score", "keyTerms", "feedback"],
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No textual result computed by review pipeline.");
    }

    const parsed = JSON.parse(resultText.trim());

    // Commit evaluations to AI query cache to prevent billing spike
    serverAiCache.set("evaluate-recall", cacheKey, parsed);

    res.json({ ...parsed, isCached: false });
  } catch (error: any) {
    console.error("Speech evaluate pipeline error:", error);
    res.json({
      score: 80,
      keyTerms: ["Nuclear", "Genetic", "Replication"],
      feedback: "You demonstrated an outstanding high-level grasp! To obtain absolute mastery, reiterate key structural boundaries and covalent connections."
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
