import { useState, useEffect } from "react";
import { useRecall } from "./RecallContext";
import { ActiveView } from "./types";

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
  const {
    isAuthenticated,
    user,
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
    logout,
    createDeck,
    addCard,
    deleteCard,
    reviewCard,
    addSchedule,
    toggleSchedule,
    addDeadline,
    clearNotifications,
    updateUserProfile,
    addSubjectMastery,
  } = useRecall();

  // Appearance Theme state
  const [themeMode, setThemeMode] = useState<"light" | "dark">(
    () => (localStorage.getItem("recall-theme") as "light" | "dark") || "light"
  );

  useEffect(() => {
    localStorage.setItem("recall-theme", themeMode);
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themeMode]);

  // Unread badge notifications tally
  const unreadCount = notifications.filter((n) => n.unread).length;

  const currentDeck = decks.find((d) => d.id === selectedDeckId) || decks[0] || {
    id: "empty",
    name: "Empty Deck",
    category: "General",
    description: "Please create a deck to get started.",
    cardsCount: 0,
    mastery: 0,
    cards: [],
  };

  const handleCardReviewedLocal = async (score: number) => {
    // Left empty since reviewCard endpoint synchronously manages reviewsCount inside the RecallContext
  };

  const handleQuizCompleted = (scorePercentage: number) => {
    // Dynamic score completion updates
  };

  const handleAcceptSharedDeck = (newDeck: any) => {
    // Shared decks handled via database mechanics
  };

  // Main screen routing matrix
  const renderCurrentView = () => {
    switch (currentView) {
      case "splash":
        return <Splash onDismiss={() => setView("auth")} />;
      case "auth":
        return <Auth />;
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
            onCreateDeck={createDeck}
          />
        );
      case "deck-detail":
        return (
          <DeckDetail 
            deck={currentDeck} 
            onBack={() => setView("library")} 
            setView={setView}
            onDeleteCard={deleteCard}
            onAddCard={addCard}
          />
        );
      case "study-session":
        return (
          <StudySession 
            deck={currentDeck} 
            onBack={() => setView("deck-detail")} 
            onCardReviewed={handleCardReviewedLocal}
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
            onDeckCreated={(newDeck) => createDeck(newDeck.name, newDeck.category, newDeck.description, newDeck.cards)} 
            setView={setView}
          />
        );
      case "ocr-import":
        return (
          <OcrImport 
            onBack={() => setView("library")} 
            onDeckCreated={(newDeck) => createDeck(newDeck.name, newDeck.category, newDeck.description, newDeck.cards)} 
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
            onToggleSchedule={toggleSchedule}
            onAddSchedule={addSchedule}
            onAddDeadline={addDeadline}
          />
        );
      case "stats":
        return (
          <Stats 
            user={user!} 
            masteryList={masteryList} 
            heatmap={heatmap}
            decks={decks}
            onAddSubjectMastery={addSubjectMastery}
          />
        );
      case "activity-stream":
        return (
          <ActivityStream 
            notifications={notifications} 
            onAcceptDeck={handleAcceptSharedDeck} 
            onClearNotifications={clearNotifications}
          />
        );
      case "settings":
        return (
          <Settings 
            user={user!} 
            onUpdateUser={updateUserProfile} 
            onLogout={logout}
            themeMode={themeMode}
            onThemeChange={setThemeMode}
          />
        );
      default:
        return <Dashboard user={user} streak={streak} reviewsCount={reviewsCount} setView={setView} weeklyStreak={7} />;
    }
  };

  // Helper boolean parameters checking whether layout bottom-nav persists
  const showNavigation = isAuthenticated && currentView !== "splash" && currentView !== "auth";

  return (
    <div className={`min-h-screen ${themeMode === "dark" ? "bg-[#0f111a] text-[#f3f4f6]" : "bg-[#faf8ff] text-[#191b23]"} flex flex-col relative transition-colors duration-300`}>
      
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
