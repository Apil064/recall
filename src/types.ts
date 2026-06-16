export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: "new" | "young" | "mature";
  difficulty?: "easy" | "good" | "hard" | "again";
  dueDate?: string;
}

export interface Deck {
  id: string;
  name: string;
  category: string;
  description: string;
  cardsCount: number;
  mastery: number; // 0 to 100
  cards: Flashcard[];
}

export interface SubjectMastery {
  subject: string;
  masteryPercent: number;
  status: "Mastered" | "Reviewing" | "Learning" | "New";
  colorClass: string;
}

export interface DailyActivity {
  dayIndex: number; // 0 to 29
  val: number; // 0, 1, 2, 3, 4
}

export interface ScheduleItem {
  id: string;
  timeString: string;
  title: string;
  durationLabel: string;
  typeLabel: string;
  completed: boolean;
}

export interface DeadlineItem {
  id: string;
  month: string;
  day: string;
  title: string;
  daysLeft: number;
  progressPercent: number;
  isUrgent: boolean;
}

export interface ActivityNotification {
  id: string;
  type: "deck_created" | "goal_achieved" | "reminder" | "shared_deck";
  title: string;
  description: string;
  timeAgo: string;
  unread: boolean;
  deckPayload?: {
    name: string;
    cardsCount: number;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  bio: string;
  joinedDate: string;
  isPro: boolean;
  linkedGoogle: boolean;
  linkedGitHub: boolean;
}

export type ActiveView =
  | "splash"
  | "auth"
  | "dashboard"
  | "library"
  | "deck-detail"
  | "study-session"
  | "quiz-session"
  | "import-notes"
  | "voice-recall"
  | "ocr-import"
  | "plan"
  | "stats"
  | "settings"
  | "activity-stream";
