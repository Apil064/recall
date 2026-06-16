import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Deck, UserProfile, SubjectMastery, DailyActivity, ScheduleItem, DeadlineItem, ActivityNotification, Flashcard } from "./src/types";

// Database structure
export interface DBUserSession {
  profile: UserProfile;
  streak: number;
  reviewsCount: number;
  masteryList: SubjectMastery[];
  heatmap: DailyActivity[];
  schedule: ScheduleItem[];
  deadlines: DeadlineItem[];
  notifications: ActivityNotification[];
  decks: Deck[];
}

export interface DatabaseSchema {
  users: Record<string, {
    passwordHash: string;
    session: DBUserSession;
  }>;
}

const DB_FILE = path.join(process.cwd(), "server_db.json");

// Helper: initial data generator
function getInitialSession(email: string, name: string): DBUserSession {
  return {
    profile: {
      name: name || "New Academician",
      email: email,
      role: "COGNITIVE SCIENCE STUDENT",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdhWOGWVCSm1juN68Z5A3I1l4szzoUsw6P0GguJ8AjDmHhGeeFQ19_g4bheMQpu8jc-mjmz5ABEAZhEPFOY6uzquoAJ3uLviRNcoDoVn7Ulycv3Bo0YgUfjq5pEgqOJh8yR9k8G-rE4EWpVaJTBZjlvTnLzfU8JnNpJBHgwi-75bLqVFkXcEF4YyFQp7TTdFzj-S787HtrCyxrqP_WmAriBiu-vaF_WvrriNRWSZt_CIOMsJjrKwtNXWLvnN2F6EjKvX4EFaYqwWPR",
      bio: "Optimizing knowledge retention through spaced repetition and active recall. Open your cognitive mastery toolkit.",
      joinedDate: "Joined June 2026",
      isPro: true,
      linkedGoogle: true,
      linkedGitHub: false,
    },
    streak: 0,
    reviewsCount: 0,
    masteryList: [],
    heatmap: Array.from({ length: 30 }).map((_, idx) => ({
      dayIndex: idx,
      val: 0,
    })),
    schedule: [],
    deadlines: [],
    notifications: [],
    decks: [],
  };
}

class ServerDatabase {
  private cache: DatabaseSchema = { users: {} };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.cache = JSON.parse(fileContent);
      } else {
        // Build default administrative user
        const defaultEmail = "alex.chen@academic.edu";
        this.cache.users[defaultEmail] = {
          passwordHash: crypto.createHash("sha256").update("password123").digest("hex"),
          session: getInitialSession(defaultEmail, "Alex Chen"),
        };
        this.save();
      }
    } catch (e) {
      console.error("Failed to load local DB, resetting cached state...", e);
      this.cache = { users: {} };
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.cache, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write to file db storage:", e);
    }
  }

  public findUser(email: string) {
    const canonicalEmail = email.toLowerCase().trim();
    return this.cache.users[canonicalEmail] || null;
  }

  public registerUser(email: string, name: string, pass: string): DBUserSession {
    const canonicalEmail = email.toLowerCase().trim();
    if (this.cache.users[canonicalEmail]) {
      throw new Error("User already exists with this email address.");
    }
    const sessionDoc = getInitialSession(canonicalEmail, name);
    this.cache.users[canonicalEmail] = {
      passwordHash: crypto.createHash("sha256").update(pass).digest("hex"),
      session: sessionDoc,
    };
    this.save();
    return sessionDoc;
  }

  public updateSession(email: string, updater: (session: DBUserSession) => void) {
    const canonicalEmail = email.toLowerCase().trim();
    const userEntry = this.cache.users[canonicalEmail];
    if (!userEntry) {
      throw new Error(`User session of ${email} not found.`);
    }
    updater(userEntry.session);
    this.save();
    return userEntry.session;
  }

  public getSession(email: string): DBUserSession {
    const canonicalEmail = email.toLowerCase().trim();
    const userEntry = this.cache.users[canonicalEmail];
    if (!userEntry) {
      throw new Error(`Session of ${email} not found.`);
    }
    return userEntry.session;
  }
}

export const serverDB = new ServerDatabase();
