import { LayoutDashboard, Flame, Play, Sparkles, TrendingUp, AlertTriangle, Camera, FileText } from "lucide-react";
import { UserProfile, ActiveView } from "../types";

interface DashboardProps {
  user: UserProfile;
  streak: number;
  reviewsCount: number;
  setView: (view: ActiveView) => void;
  weeklyStreak: number;
}

export default function Dashboard({ user, streak, reviewsCount, setView, weeklyStreak }: DashboardProps) {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-5 pt-6 pb-24 space-y-6 font-sans">
      
      {/* Header Bar */}
      <header className="flex justify-between items-center h-[64px] border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#004ac6]/10">
            <img 
              alt="User Profile" 
              className="w-full h-full object-cover" 
              src={user.avatarUrl} 
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-xl font-extrabold text-[#004ac6]">Recall</h2>
        </div>
        <div className="flex bg-[#2563eb]/10 text-[#004ac6] border border-[#2563eb]/20 px-3 py-1.5 rounded-full items-center gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider">{user.role}</span>
        </div>
      </header>

      {/* Hero Section: Today's Reviews */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-[#2563eb] text-white rounded-2xl p-6 relative overflow-hidden shadow-md border border-black/5 flex flex-col justify-between min-h-[220px]">
          <div className="relative z-10 space-y-4">
            <div>
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">Focus Session</span>
              <h2 className="text-3xl font-extrabold mt-3">Today's Reviews</h2>
              <p className="text-sm md:text-base opacity-95 max-w-md mt-1 leading-relaxed">
                {reviewsCount > 0 
                  ? `You have ${reviewsCount} cards ready for review across 3 subjects. Keep the momentum going!` 
                  : "All caught up for today! Excellent work maintaining your active recall schedule!"}
              </p>
            </div>
            
            {reviewsCount > 0 && (
              <button 
                onClick={() => setView("study-session")}
                className="h-11 px-6 bg-white text-[#2563eb] font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Start Now</span>
                <Play className="w-4 h-4 fill-current" />
              </button>
            )}
          </div>
          
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none self-end">
            <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_stories
            </span>
          </div>
        </div>

        {/* Study Streak Indicator */}
        <div className="md:col-span-4 bg-white rounded-2xl p-6 flex flex-col justify-between shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="flex justify-between items-start">
            <div className="bg-[#ffdbcd] text-[#360f00] p-3 rounded-xl">
              <Flame className="w-6 h-6 text-[#ba1a1a] fill-current" />
            </div>
            <span className="bg-emerald-100 text-teal-800 text-xs font-extrabold px-2.5 py-1 rounded-full">Active</span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-[#191b23]">{streak} Day</h3>
            <p className="text-xs font-medium text-[#434655] uppercase tracking-wider mt-1">Current Streak</p>
          </div>
          <div className="flex gap-1.5 mt-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 flex-grow rounded-full ${
                  i < streak ? "bg-teal-600" : "bg-gray-200"
                }`} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats & Recommendations Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Weekly Performance Representation */}
        <div className="md:col-span-7 bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#191b23]">Weekly Performance</h3>
            <span className="text-xs font-bold text-[#004ac6] bg-[#004ac6]/10 px-3 py-1.5 rounded-full">Last 7 Days</span>
          </div>

          <div className="h-44 w-full flex items-end justify-between gap-3 px-2">
            {[
              { day: "M", val: 40 },
              { day: "T", val: 65 },
              { day: "W", val: 55 },
              { day: "T", val: 90 },
              { day: "F", val: 30 },
              { day: "S", val: 75 },
              { day: "S", val: 85 }
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-2 group cursor-pointer">
                <div 
                  style={{ height: `${bar.val}%` }} 
                  className="w-full bg-[#b4c5ff] hover:bg-[#004ac6] rounded-t-lg transition-all duration-300" 
                />
                <span className="text-xs font-semibold text-[#434655]">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="md:col-span-5 bg-[#f3f3fe] rounded-2xl p-6 space-y-4 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="flex items-center gap-2 text-[#004ac6]">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-lg font-bold">AI Insights</h3>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 flex gap-4 hover:shadow-sm transition-shadow">
              <div className="bg-[#6df5e1]/30 text-[#006f64] w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#191b23]">Morning Mastery</p>
                <p className="text-xs text-[#434655] mt-0.5 leading-snug">You're 20% more accurate before 10 AM. Try reviewing then.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 flex gap-4 hover:shadow-sm transition-shadow">
              <div className="bg-[#ffdbcd] text-[#bc4800] w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#191b23]">Neural Fatigue</p>
                <p className="text-xs text-[#434655] mt-0.5 leading-snug">Data shows you miss more physics cards after 45 minutes of study.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Reviews Timeline */}
      <section className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
        <h3 className="text-lg font-bold text-[#191b23] mb-4">Upcoming Reviews</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto pb-1">
          <div className="bg-[#faf8ff] p-4 rounded-xl border border-[#c3c6d7]/30 flex items-center gap-4">
            <div className="w-2.5 h-12 bg-[#004ac6] rounded-full" />
            <div>
              <p className="text-sm font-bold text-[#191b23]">Next Hour</p>
              <p className="text-xs text-[#434655] mt-0.5">12 Cards • Bio-Chemistry</p>
            </div>
          </div>
          
          <div className="bg-[#faf8ff] p-4 rounded-xl border border-[#c3c6d7]/30 flex items-center gap-4">
            <div className="w-2.5 h-12 bg-teal-500 rounded-full" />
            <div>
              <p className="text-sm font-bold text-[#191b23]">This Evening</p>
              <p className="text-xs text-[#434655] mt-0.5">8 Cards • Microeconomics</p>
            </div>
          </div>

          <div className="bg-[#faf8ff] p-4 rounded-xl border border-[#c3c6d7]/30 flex items-center gap-4">
            <div className="w-2.5 h-12 bg-[#737686] rounded-full" />
            <div>
              <p className="text-sm font-bold text-[#191b23]">Tomorrow</p>
              <p className="text-xs text-[#434655] mt-0.5">34 Cards • Language Arts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contextual FAB to import or add notes */}
      <div className="fixed bottom-24 right-5 flex flex-col gap-3.5 z-40 items-end">
        <button 
          onClick={() => setView("import-notes")}
          className="h-12 px-4 bg-white border border-[#2563eb]/20 text-[#004ac6] font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer flex items-center gap-1.5 text-xs"
          title="Import Lecture Notes"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Compile Notes</span>
        </button>
        <button 
          onClick={() => setView("ocr-import")}
          className="h-12 px-4 bg-white border border-[#2563eb]/20 text-[#004ac6] font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer flex items-center gap-1.5 text-xs"
          title="Scan Textbook Page"
        >
          <Camera className="w-4 h-4" />
          <span>Simulate OCR Scan</span>
        </button>
      </div>

    </div>
  );
}
