import React, { createContext, useContext, useState, useEffect } from "react";
import { Deck, UserProfile, SubjectMastery, DailyActivity, ScheduleItem, DeadlineItem, ActivityNotification, Flashcard, ActiveView } from "./types";

interface RecallContextType {
  // Authentication
  isAuthenticated: boolean;
  token: string | null;
  userEmail: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // App routing
  currentView: ActiveView;
  setView: (view: ActiveView) => void;
  selectedDeckId: string | null;
  setSelectedDeckId: (id: string | null) => void;

  // Global Core States
  decks: Deck[];
  streak: number;
  reviewsCount: number;
  masteryList: SubjectMastery[];
  heatmap: DailyActivity[];
  schedule: ScheduleItem[];
  deadlines: DeadlineItem[];
  notifications: ActivityNotification[];

  // Action Methods
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, name: string, pass: string) => Promise<boolean>;
  logout: () => void;
  reviewCard: (deckId: string, cardId: string, rating: "again" | "hard" | "good" | "easy") => Promise<void>;
  createDeck: (name: string, category: string, description: string, cards?: Flashcard[]) => Promise<void>;
  addCard: (deckId: string, question: string, answer: string, category: string) => Promise<void>;
  deleteCard: (deckId: string, cardId: string) => Promise<void>;
  addSchedule: (title: string, timeString: string, durationLabel: string, typeLabel: string) => Promise<void>;
  toggleSchedule: (id: string) => Promise<void>;
  addDeadline: (title: string, month: string, day: string, daysLeft: number, urgency: boolean) => Promise<void>;
  clearNotifications: () => Promise<void>;
  addNotificationGlobal: (type: "deck_created" | "goal_achieved" | "reminder" | "shared_deck", title: string, desc: string) => Promise<void>;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  addSubjectMastery: (subject: string, masteryPercent: number, status: "Mastered" | "Reviewing" | "Learning" | "New") => Promise<void>;
}

const RecallContext = createContext<RecallContextType | undefined>(undefined);

export function RecallProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentView, setView] = useState<ActiveView>("splash");
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  // States initialized empty in the client, and automatically loaded from the persistent server DB!
  const [decks, setDecks] = useState<Deck[]>([]);
  const [streak, setStreak] = useState(15);
  const [reviewsCount, setReviewsCount] = useState(12);
  const [masteryList, setMasteryList] = useState<SubjectMastery[]>([]);
  const [heatmap, setHeatmap] = useState<DailyActivity[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);

  // Local storage auto login checks
  useEffect(() => {
    const savedToken = localStorage.getItem("recall_token");
    const savedEmail = localStorage.getItem("recall_email");
    if (savedToken && savedEmail) {
      setToken(savedToken);
      setUserEmail(savedEmail);
      setIsAuthenticated(true);
      fetchServerState(savedEmail);
    }
  }, []);

  // Helper code to synchronize client-side changes into the database
  const saveStateToServer = async (email: string, partialSession: any) => {
    try {
      await fetch("/api/state/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, session: partialSession }),
      });
    } catch (err) {
      console.error("Local sync uplink failed:", err);
    }
  };

  const fetchServerState = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/state?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.session) {
          applySessionState(data.session);
        }
      } else {
        const errData = await response.json();
        setError(errData.error || "Failed to load state.");
      }
    } catch (err: any) {
      setError("Network or local file-system persistence offline.");
    } finally {
      setIsLoading(false);
    }
  };

  const applySessionState = (session: any) => {
    setUser(session.profile);
    setDecks(session.decks || []);
    setStreak(session.streak ?? 15);
    setReviewsCount(session.reviewsCount ?? 12);
    setMasteryList(session.masteryList || []);
    setHeatmap(session.heatmap || []);
    setSchedule(session.schedule || []);
    setDeadlines(session.deadlines || []);
    setNotifications(session.notifications || []);
  };

  const makeSessionSnapshot = (customDecks = decks) => {
    return {
      profile: user,
      streak,
      reviewsCount,
      masteryList,
      heatmap,
      schedule,
      deadlines,
      notifications,
      decks: customDecks,
    };
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setUserEmail(data.userEmail);
        setIsAuthenticated(true);
        applySessionState(data.session);

        localStorage.setItem("recall_token", data.token);
        localStorage.setItem("recall_email", data.userEmail);
        setView("dashboard");
        return true;
      } else {
        const err = await response.json();
        setError(err.error || "Authentication crashed.");
        return false;
      }
    } catch (err) {
      setError("Server connections unavailable.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, name: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password: pass }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setUserEmail(data.userEmail);
        setIsAuthenticated(true);
        applySessionState(data.session);

        localStorage.setItem("recall_token", data.token);
        localStorage.setItem("recall_email", data.userEmail);
        setView("dashboard");
        return true;
      } else {
        const err = await response.json();
        setError(err.error || "Registration rejected.");
        return false;
      }
    } catch (err) {
      setError("Database backend unavailable.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUserEmail(null);
    setIsAuthenticated(false);
    setUser(null);
    setDecks([]);
    localStorage.removeItem("recall_token");
    localStorage.removeItem("recall_email");
    setView("auth");
  };

  // Real spacing repetition execution on the server
  const reviewCard = async (deckId: string, cardId: string, rating: "again" | "hard" | "good" | "easy") => {
    if (!userEmail) return;

    try {
      const response = await fetch("/api/card/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, deckId, cardId, rating }),
      });

      if (response.ok) {
        const data = await response.json();
        applySessionState(data.session);
      }
    } catch (e) {
      console.error("Spaced repetition synchronization missed:", e);
      // Fallback local study review increment inside client
      setReviewsCount((prev) => Math.max(0, prev - 1));
    }
  };

  const createDeck = async (name: string, category: string, description: string, cards?: Flashcard[]) => {
    if (!userEmail) return;
    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      name,
      category,
      description,
      cardsCount: cards ? cards.length : 0,
      mastery: 0,
      cards: cards || [],
    };

    const nextDecks = [newDeck, ...decks];
    setDecks(nextDecks);

    // Dynamic notifications
    const newNot: ActivityNotification = {
      id: `not-${Date.now()}`,
      type: "deck_created",
      title: "New Deck Created",
      description: `You successfully initialized the "${name}" deck under category ${category}.`,
      timeAgo: "Just now",
      unread: true,
    };
    
    const nextNotifications = [newNot, ...notifications];
    setNotifications(nextNotifications);

    // Save and send state
    const snapshotObj = makeSessionSnapshot(nextDecks);
    snapshotObj.notifications = nextNotifications;
    await saveStateToServer(userEmail, snapshotObj);
  };

  const addCard = async (deckId: string, question: string, answer: string, category: string) => {
    if (!userEmail) return;
    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      question,
      answer,
      category,
      status: "new",
      easinessFactor: 2.5,
      interval: 0,
      repetitions: 0,
      dueDate: new Date().toISOString(),
    };

    const updatedDecks = decks.map((deck) => {
      if (deck.id === deckId) {
        const newCards = [newCard, ...deck.cards];
        return {
          ...deck,
          cards: newCards,
          cardsCount: newCards.length,
        };
      }
      return deck;
    });

    setDecks(updatedDecks);
    await saveStateToServer(userEmail, makeSessionSnapshot(updatedDecks));
  };

  const deleteCard = async (deckId: string, cardId: string) => {
    if (!userEmail) return;
    const updatedDecks = decks.map((deck) => {
      if (deck.id === deckId) {
        const revisedCards = deck.cards.filter((c) => c.id !== cardId);
        return {
          ...deck,
          cards: revisedCards,
          cardsCount: revisedCards.length,
        };
      }
      return deck;
    });

    setDecks(updatedDecks);
    await saveStateToServer(userEmail, makeSessionSnapshot(updatedDecks));
  };

  const addSchedule = async (title: string, timeString: string, durationLabel: string, typeLabel: string) => {
    if (!userEmail) return;
    const newItem: ScheduleItem = {
      id: `sch-${Date.now()}`,
      title,
      timeString,
      durationLabel,
      typeLabel,
      completed: false,
    };

    const updated = [...schedule, newItem];
    setSchedule(updated);

    const snapshotObj = makeSessionSnapshot();
    snapshotObj.schedule = updated;
    await saveStateToServer(userEmail, snapshotObj);
  };

  const toggleSchedule = async (id: string) => {
    if (!userEmail) return;
    const updated = schedule.map((item) => {
      if (item.id === id) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });
    setSchedule(updated);

    const snapshotObj = makeSessionSnapshot();
    snapshotObj.schedule = updated;
    await saveStateToServer(userEmail, snapshotObj);
  };

  const addDeadline = async (title: string, month: string, day: string, daysLeft: number, urgency: boolean) => {
    if (!userEmail) return;
    const newItem: DeadlineItem = {
      id: `dl-${Date.now()}`,
      title,
      month,
      day,
      daysLeft,
      progressPercent: 10,
      isUrgent: urgency,
    };

    const updated = [...deadlines, newItem];
    setDeadlines(updated);

    const snapshotObj = makeSessionSnapshot();
    snapshotObj.deadlines = updated;
    await saveStateToServer(userEmail, snapshotObj);
  };

  const clearNotifications = async () => {
    if (!userEmail) return;
    setNotifications([]);

    const snapshotObj = makeSessionSnapshot();
    snapshotObj.notifications = [];
    await saveStateToServer(userEmail, snapshotObj);
  };

  const addNotificationGlobal = async (type: "deck_created" | "goal_achieved" | "reminder" | "shared_deck", title: string, desc: string) => {
    if (!userEmail) return;
    const item: ActivityNotification = {
      id: `not-${Date.now()}`,
      type,
      title,
      description: desc,
      timeAgo: "Just now",
      unread: true,
    };

    const updated = [item, ...notifications];
    setNotifications(updated);

    const snapshotObj = makeSessionSnapshot();
    snapshotObj.notifications = updated;
    await saveStateToServer(userEmail, snapshotObj);
  };

  const updateUserProfile = async (profile: UserProfile) => {
    if (!userEmail) return;
    setUser(profile);
    const snapshotObj = makeSessionSnapshot();
    snapshotObj.profile = profile;
    await saveStateToServer(userEmail, snapshotObj);
  };

  const addSubjectMastery = async (subject: string, masteryPercent: number, status: "Mastered" | "Reviewing" | "Learning" | "New") => {
    if (!userEmail) return;
    const colors = ["bg-primary", "text-[#004ac6]", "bg-[#2563eb]", "bg-teal-500", "bg-emerald-500", "bg-indigo-500"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newItem: SubjectMastery = {
      subject,
      masteryPercent,
      status,
      colorClass: randomColor,
    };
    const updated = [...masteryList, newItem];
    setMasteryList(updated);
    const snapshotObj = makeSessionSnapshot();
    snapshotObj.masteryList = updated;
    await saveStateToServer(userEmail, snapshotObj);
  };

  return (
    <RecallContext.Provider
      value={{
        isAuthenticated,
        token,
        userEmail,
        user,
        isLoading,
        error,
        currentView,
        setView,
        selectedDeckId,
        setSelectedDeckId,
        decks,
        streak,
        reviewsCount,
        masteryList,
        heatmap,
        schedule,
        deadlines,
        notifications,
        login,
        signup,
        logout,
        reviewCard,
        createDeck,
        addCard,
        deleteCard,
        addSchedule,
        toggleSchedule,
        addDeadline,
        clearNotifications,
        addNotificationGlobal,
        updateUserProfile,
        addSubjectMastery,
      }}
    >
      {children}
    </RecallContext.Provider>
  );
}

export function useRecall() {
  const context = useContext(RecallContext);
  if (context === undefined) {
    throw new Error("useRecall must be used inside a RecallProvider.");
  }
  return context;
}
