import { useState, useEffect } from "react";
import { ActiveView, Deck, UserProfile, ScheduleItem, DeadlineItem, ActivityNotification, Flashcard, SubjectMastery } from "./types";
import { 
  initialUserProfile, 
  initialDecks, 
  initialSubjectMastery, 
  initialHeatmap, 
  initialSchedule, 
  initialDeadlines, 
  initialNotifications 
} from "./mockData";

// View imports
import Splash from "./components/Splash";
import Auth from "./components/Auth";
import BottomNavigation from "./components/BottomNavigation";
import Dashboard from "./components/Dashboard";
import Library from "./components/Library";
import DeckDetail from "./components/DeckDetail";
import StudySession from "./components/StudySession";
import QuizSession from "./components/QuizSession";
import ImportNotes from "./components/ImportNotes";
import VoiceRecall from "./components/VoiceRecall";
import OcrImport from "./components/OcrImport";
import WeeklyPlan from "./components/WeeklyPlan";
import Stats from "./components/Stats";
import ActivityStream from "./components/ActivityStream";
import Settings from "./components/Settings";

export default function App() {
  // Screens navigation
  const [currentView, setView] = useState<ActiveView>("splash");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Core Data State
  const [user, setUser] = useState<UserProfile>(initialUserProfile);
  const [decks, setDecks] = useState<Deck[]>(initialDecks);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  // Planning / Habits Data State
  const [schedule, setSchedule] = useState<ScheduleItem[]>(initialSchedule);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>(initialDeadlines);

  // Alerts Alerts Inbox
  const [notifications, setNotifications] = useState<ActivityNotification[]>(initialNotifications);

  // Dynamically tracked gamified metrics
  const [streak, setStreak] = useState(15);
  const [reviewsCount, setReviewsCount] = useState(12);

  // Dynamic Subject Mastery representation state
  const [masteryList, setMasteryList] = useState<SubjectMastery[]>(initialSubjectMastery);

  // Unread badge notifications tally
  const unreadCount = notifications.filter((n) => n.unread).length;

  const currentDeck = decks.find((d) => d.id === selectedDeckId) || decks[0];

  const handleLogin = () => {
    setIsAuthenticated(true);
    setView("dashboard");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView("auth");
  };

  // State modification triggers
  const handleCardReviewed = (scoreChange: number) => {
    setReviewsCount((prev) => Math.max(0, prev - 1));
    if (scoreChange > 3) {
      setStreak((prev) => prev === 15 ? 16 : prev);
    }
  };

  const handleQuizCompleted = (scorePercentage: number) => {
    if (scorePercentage >= 70) {
      setStreak((prev) => prev === 15 ? 16 : prev);
    }
  };

  const handleAddCard = (deckId: string, question: string, answer: string, category: string) => {
    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      question,
      answer,
      category,
      status: "new",
    };

    setDecks((prevDecks) =>
      prevDecks.map((deck) => {
        if (deck.id === deckId) {
          return {
            ...deck,
            cards: [newCard, ...deck.cards],
            cardsCount: deck.cards.length + 1,
          };
        }
        return deck;
      })
    );
  };

  const handleDeleteCard = (deckId: string, cardId: string) => {
    setDecks((prevDecks) =>
      prevDecks.map((deck) => {
        if (deck.id === deckId) {
          const revised = deck.cards.filter((c) => c.id !== cardId);
          return {
            ...deck,
            cards: revised,
            cardsCount: revised.length,
          };
        }
        return deck;
      })
    );
  };

  const handleCreateDeck = (name: string, category: string, description: string) => {
    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      name,
      category,
      description,
      cardsCount: 0,
      mastery: 0,
      cards: [],
    };

    setDecks([newDeck, ...decks]);
    
    // Add activity notice
    const newNot: ActivityNotification = {
      id: `not-${Date.now()}`,
      type: "deck_created",
      title: "New deck created",
      description: `You successfully initialized the "${name}" deck under category ${category}.`,
      timeAgo: "Just now",
      unread: true,
    };
    setNotifications([newNot, ...notifications]);
  };

  const handleAcceptSharedDeck = (newDeck: Deck) => {
    setDecks([newDeck, ...decks]);
  };

  const handleToggleSchedule = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextCompletedState = !item.completed;
          if (nextCompletedState) {
            // Give reward progress dynamically on stats
            setMasteryList((prevList) =>
              prevList.map((m) => {
                if (m.subject === "Organic Chemistry") {
                  return { ...m, masteryPercent: Math.min(100, m.masteryPercent + 8), status: "Reviewing" };
                }
                return m;
              })
            );
          }
          return { ...item, completed: nextCompletedState };
        }
        return item;
      })
    );
  };

  const handleAddSchedule = (title: string, timeString: string, durationLabel: string, typeLabel: string) => {
    const newItem: ScheduleItem = {
      id: `sch-${Date.now()}`,
      title,
      timeString,
      durationLabel,
      typeLabel,
      completed: false,
    };
    setSchedule([...schedule, newItem]);
  };

  const handleAddDeadline = (title: string, month: string, day: string, daysLeft: number, urgency: boolean) => {
    const newItem: DeadlineItem = {
      id: `dl-${Date.now()}`,
      title,
      month,
      day,
      daysLeft,
      progressPercent: 10,
      isUrgent: urgency,
    };
    setDeadlines([...deadlines, newItem]);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Main screen routing matrix
  const renderCurrentView = () => {
    switch (currentView) {
      case "splash":
        return <Splash onDismiss={() => setView("auth")} />;
      case "auth":
        return <Auth onLogin={handleLogin} />;
      case "dashboard":
        return (
          <Dashboard 
            user={user} 
            streak={streak} 
            reviewsCount={reviewsCount} 
            setView={setView} 
            weeklyStreak={7}
          />
        );
      case "library":
        return (
          <Library 
            decks={decks} 
            setSelectedDeckId={setSelectedDeckId} 
            setView={setView} 
            onCreateDeck={handleCreateDeck}
          />
        );
      case "deck-detail":
        return (
          <DeckDetail 
            deck={currentDeck} 
            onBack={() => setView("library")} 
            setView={setView}
            onDeleteCard={handleDeleteCard}
            onAddCard={handleAddCard}
          />
        );
      case "study-session":
        return (
          <StudySession 
            deck={currentDeck} 
            onBack={() => setView("deck-detail")} 
            onCardReviewed={handleCardReviewed}
          />
        );
      case "quiz-session":
        return (
          <QuizSession 
            deck={currentDeck} 
            onBack={() => setView("deck-detail")} 
            onQuizCompleted={handleQuizCompleted}
          />
        );
      case "import-notes":
        return (
          <ImportNotes 
            onBack={() => setView("library")} 
            onDeckCreated={handleAcceptSharedDeck} 
            setView={setView}
          />
        );
      case "ocr-import":
        return (
          <OcrImport 
            onBack={() => setView("library")} 
            onDeckCreated={handleAcceptSharedDeck} 
            setView={setView}
          />
        );
      case "voice-recall":
        return (
          <VoiceRecall 
            deck={currentDeck} 
            onBack={() => setView("deck-detail")} 
            setView={setView}
          />
        );
      case "plan":
        return (
          <WeeklyPlan 
            schedule={schedule} 
            deadlines={deadlines} 
            onToggleSchedule={handleToggleSchedule}
            onAddSchedule={handleAddSchedule}
            onAddDeadline={handleAddDeadline}
          />
        );
      case "stats":
        return (
          <Stats 
            user={user} 
            masteryList={masteryList} 
            heatmap={initialHeatmap}
          />
        );
      case "activity-stream":
        return (
          <ActivityStream 
            notifications={notifications} 
            onAcceptDeck={handleAcceptSharedDeck} 
            onClearNotifications={handleClearNotifications}
          />
        );
      case "settings":
        return (
          <Settings 
            user={user} 
            onUpdateUser={setUser} 
            onLogout={handleLogout}
          />
        );
      default:
        return <Dashboard user={user} streak={streak} reviewsCount={reviewsCount} setView={setView} weeklyStreak={7} />;
    }
  };

  // Helper boolean parameters checking whether layout bottom-nav persists
  const showNavigation = isAuthenticated && currentView !== "splash" && currentView !== "auth";

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col text-[#191b23] relative">
      
      {/* Dynamic Screen viewport */}
      <main className="flex-grow">
        {renderCurrentView()}
      </main>

      {/* Global Bottom Navigation bar */}
      {showNavigation && (
        <BottomNavigation 
          currentView={currentView} 
          setView={setView} 
          unreadCount={unreadCount}
        />
      )}

      {/* Embedded ambient overlay shadows */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] z-50 bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />
    </div>
  );
}
