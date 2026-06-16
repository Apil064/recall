import { LayoutDashboard, BookOpen, Calendar, BarChart2, Settings, Bell } from "lucide-react";
import { ActiveView } from "../types";

interface BottomNavigationProps {
  currentView: ActiveView;
  setView: (view: ActiveView) => void;
  unreadCount?: number;
}

export default function BottomNavigation({ currentView, setView, unreadCount = 0 }: BottomNavigationProps) {
  // Navigation tabs definition
  const tabs = [
    {
      view: "dashboard" as ActiveView,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      view: "library" as ActiveView,
      label: "Library",
      icon: BookOpen,
    },
    {
      view: "plan" as ActiveView,
      label: "Plan",
      icon: Calendar,
    },
    {
      view: "stats" as ActiveView,
      label: "Stats",
      icon: BarChart2,
    },
    {
      view: "activity-stream" as ActiveView,
      label: "Activity",
      icon: Bell,
      badge: true,
    },
    {
      view: "settings" as ActiveView,
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-[#2e3039] border-t border-[#c3c6d7]/30 shadow-[0px_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl z-50 transition-all font-sans duration-200">
      <div className="flex justify-around items-center px-4 py-2 pb-safe max-w-[1200px] mx-auto w-full">
        {tabs.map((tab) => {
          const isActive = currentView === tab.view || 
            (tab.view === "library" && currentView === "deck-detail") ||
            (tab.view === "library" && currentView === "study-session") ||
            (tab.view === "library" && currentView === "quiz-session") ||
            (tab.view === "library" && currentView === "import-notes") ||
            (tab.view === "library" && currentView === "voice-recall") ||
            (tab.view === "library" && currentView === "ocr-import");

          const IconComponent = tab.icon;

          return (
            <button
              key={tab.view}
              onClick={() => setView(tab.view)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer select-none ${
                isActive
                  ? "bg-[#2563eb]/10 text-[#004ac6] dark:text-[#b4c5ff] px-4 font-semibold scale-102"
                  : "text-[#434655] dark:text-gray-300 hover:text-[#004ac6]"
              }`}
            >
              <div className="relative">
                <IconComponent className="w-5 h-5 md:w-6 h-6" />
                {tab.badge && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#ba1a1a] text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-sans">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] md:text-xs mt-1 block">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
