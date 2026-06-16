import fs from "fs";
import path from "path";
import crypto from "crypto";

const CACHE_FILE = path.join(process.cwd(), "ai_cache.json");

class ServerAiCache {
  private cacheStore: Record<string, any> = {};

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(CACHE_FILE)) {
        this.cacheStore = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      }
    } catch (e) {
      console.error("AI cache failed to load. Initializing as empty:", e);
      this.cacheStore = {};
    }
  }

  private save() {
    try {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(this.cacheStore, null, 2), "utf-8");
    } catch (e) {
      console.error("AI cache failed to write to disk:", e);
    }
  }

  private getHash(query: string): string {
    return crypto.createHash("sha256").update(query.trim()).digest("hex");
  }

  public get(namespace: string, query: string): any | null {
    const key = `${namespace}:${this.getHash(query)}`;
    const hit = this.cacheStore[key];
    if (hit) {
      console.log(`[AI CACHE HIT] Namespace "${namespace}" returned cached results.`);
      return hit;
    }
    return null;
  }

  public set(namespace: string, query: string, value: any) {
    const key = `${namespace}:${this.getHash(query)}`;
    this.cacheStore[key] = value;
    this.save();
    console.log(`[AI CACHE SET] Entry added under namespace "${namespace}".`);
  }
}

export const serverAiCache = new ServerAiCache();
