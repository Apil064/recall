import { useState } from "react";
import { ActivityNotification, Deck, Flashcard } from "../types";
import { Bell, Shield, BookOpen, Clock, Trash, Trash2, CheckCircle, ArrowRight } from "lucide-react";

interface ActivityStreamProps {
  notifications: ActivityNotification[];
  onAcceptDeck: (deck: Deck) => void;
  onClearNotifications: () => void;
}

export default function ActivityStream({ 
  notifications: initialNotes, 
  onAcceptDeck, 
  onClearNotifications 
}: ActivityStreamProps) {
  const [list, setList] = useState<ActivityNotification[]>(initialNotes);
  const [successMsg, setSuccessMsg] = useState("");

  const handleAction = (notId: string, action: "accept" | "ignore") => {
    const target = list.find((n) => n.id === notId);
    if (!target) return;

    if (action === "accept" && target.deckPayload) {
      // Build a fully functional deck with high-fidelity microeconomic cards inside!
      const finalPrepDeck: Deck = {
        id: `shared-econ-${Date.now()}`,
        name: target.deckPayload.name,
        category: "Economics",
        description: `Academic prep resource targeting Advanced Microeconomics Finals shared by Sarah.`,
        cardsCount: target.deckPayload.cardsCount,
        mastery: 15,
        cards: [
          {
            id: "me-1",
            question: "Define Nash Equilibrium in game theory",
            answer: "A state in an interactive game where no player has an incentive to unilaterally deviate from their chosen strategy, given the decisions of all other players.",
            category: "Economics",
            status: "new"
          },
          {
            id: "me-2",
            question: "What is the Pareto Efficiency criterion?",
            answer: "An economic state where resources are allocated in the most efficient manner, such that it is impossible to make any one individual better off without making at least one individual worse off.",
            category: "Economics",
            status: "young"
          }
        ]
      };

      onAcceptDeck(finalPrepDeck);
      setSuccessMsg(`"${target.deckPayload.name}" was successfully added to your Academic Library!`);
      setTimeout(() => setSuccessMsg(""), 4500);
    }

    // Filter notification from listing
    setList(list.filter((n) => n.id !== notId));
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-5 pt-4 pb-28 space-y-6 font-sans text-left animate-fade-in">
      
      {/* Header with quick clears */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
        <h2 className="text-xl font-bold text-[#191b23] flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#004ac6]" />
          <span>Notifications & Shares</span>
        </h2>
        
        {list.length > 0 && (
          <button
            onClick={() => {
              setList([]);
              onClearNotifications();
            }}
            className="text-xs text-[#737686] hover:text-[#ba1a1a] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-xs text-teal-800 font-bold flex items-center gap-2.5 shadow-sm animate-scale-up">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {list.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-dashed border-gray-200">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-500">All Quiet For Now</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">You've cleared all alerts, shared deck invites, and streak milestone notifications.</p>
        </div>
      ) : (
        <section className="space-y-4">
          {list.map((item) => (
            <div 
              key={item.id} 
              className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start gap-4 ${
                item.unread 
                  ? "bg-[#2563eb]/5 border-[#004ac6]/15 shadow-sm" 
                  : "bg-white border-gray-150"
              }`}
            >
              <div className="flex-grow space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.unread ? "bg-[#004ac6]" : "bg-transparent"}`} />
                  <h4 className="text-sm font-extrabold text-[#191b23]">{item.title}</h4>
                </div>
                <p className="text-xs text-[#434655] leading-relaxed pl-4">{item.description}</p>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold pl-4 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.timeAgo}</span>
                </div>
              </div>

              {/* Shared Deck CTA trigger details (Screen 5) */}
              {item.type === "shared_deck" && item.deckPayload && (
                <div className="shrink-0 flex items-center gap-2 self-end pl-4 md:pl-0 mt-2 md:mt-0">
                  <button
                    onClick={() => handleAction(item.id, "ignore")}
                    className="px-3.5 h-8 bg-white border border-[#c3c6d7] text-xs font-bold rounded-lg text-gray-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Ignore
                  </button>
                  <button
                    onClick={() => handleAction(item.id, "accept")}
                    className="px-3.5 h-8 bg-[#004ac6] text-white text-xs font-black rounded-lg hover:bg-[#2563eb] cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Accept Deck</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

    </div>
  );
}
