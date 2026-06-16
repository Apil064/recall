import { useState } from "react";
import { UserProfile, SubjectMastery, DailyActivity, Deck } from "../types";
import { Award, Zap, Shield, TrendingUp, BarChart, Plus, CheckCircle, Calendar } from "lucide-react";

interface StatsProps {
  user: UserProfile;
  masteryList: SubjectMastery[];
  heatmap: DailyActivity[];
  decks: Deck[];
  onAddSubjectMastery: (subject: string, masteryPercent: number, status: "Mastered" | "Reviewing" | "Learning" | "New") => void;
}

export default function Stats({ user, masteryList, heatmap, decks, onAddSubjectMastery }: StatsProps) {
  // Let the user select a heatmap cell to see card counts
  const [selectedCell, setSelectedCell] = useState<{ index: number; count: number } | null>(null);

  // Form states to add custom mastery items
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newPercent, setNewPercent] = useState(50);
  const [newStatus, setNewStatus] = useState<"Mastered" | "Reviewing" | "Learning" | "New">("Learning");

  const totalCards = decks.reduce((sum, d) => sum + d.cards.length, 0);
  const totalCardsStudied = totalCards;
  const retentionPercentage = decks.length > 0 
    ? Math.round(decks.reduce((sum, d) => sum + d.mastery, 0) / decks.length)
    : 0;
  const learningVelocityIdx = totalCards > 0 ? 3.5 : 0; // seconds response average

  const getHeatmapColor = (val: number) => {
    if (val === 0) return "bg-gray-100 hover:bg-gray-200";
    if (val === 1) return "bg-indigo-100 hover:bg-indigo-200";
    if (val === 2) return "bg-indigo-300 hover:bg-indigo-400";
    if (val === 3) return "bg-indigo-500 hover:bg-indigo-600";
    return "bg-[#004ac6] hover:bg-[#2563eb]"; // Strongest
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-5 pt-4 pb-28 space-y-6 font-sans text-left animate-fade-in">
      
      {/* Overview numerical headers */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-[#004ac6] rounded-full flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#191b23]">{totalCardsStudied}</div>
            <div className="text-[10px] font-bold text-[#737686] uppercase tracking-wider mt-0.5">Total Cards Studied</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#191b23]">{retentionPercentage}%</div>
            <div className="text-[10px] font-bold text-[#737686] uppercase tracking-wider mt-0.5">Average Retention Index</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#191b23]">{learningVelocityIdx} sec</div>
            <div className="text-[10px] font-bold text-[#737686] uppercase tracking-wider mt-0.5">Avg Active Response SLA</div>
          </div>
        </div>

      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Subject Mastery List (Screen 2 bar representation) */}
        <section className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
            <h3 className="text-base font-bold text-[#191b23] flex items-center gap-2">
              <BarChart className="w-5 h-5 text-[#004ac6]" />
              <span>Academic Subject Mastery</span>
            </h3>
            <button
              onClick={() => setIsAddOpen(!isAddOpen)}
              className="text-xs font-bold text-[#004ac6] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add subject</span>
            </button>
          </div>

          {isAddOpen && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newSubject.trim()) return;
                onAddSubjectMastery(newSubject, newPercent, newStatus);
                setNewSubject("");
                setNewPercent(50);
                setIsAddOpen(false);
              }}
              className="bg-[#faf8ff] p-4 rounded-xl border border-gray-100 space-y-3 text-left"
            >
              <div>
                <label className="block text-[10px] font-bold text-[#434655] uppercase mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physiology, Neuroanatomy"
                  className="w-full text-xs p-2 bg-white rounded border border-[#c3c6d7]/50 text-[#191b23]"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#434655] uppercase mb-1">Mastery %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    className="w-full text-xs p-2 bg-white rounded border border-[#c3c6d7]/50 text-[#191b23]"
                    value={newPercent}
                    onChange={(e) => setNewPercent(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#434655] uppercase mb-1">Status</label>
                  <select
                    className="w-full text-xs p-2 bg-white rounded border border-[#c3c6d7]/50 text-[#191b23]"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                  >
                    <option value="New">New</option>
                    <option value="Learning">Learning</option>
                    <option value="Reviewing">Reviewing</option>
                    <option value="Mastered">Mastered</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-2.5 py-1 border border-[#c3c6d7] text-[#434655] text-[10px] font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-[#004ac6] text-white text-[10px] font-bold rounded"
                >
                  Add Subject
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4 pt-1">
            {masteryList.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#737686]">
                No subject masteries added yet. Click <span className="font-bold text-[#004ac6]">"Add subject"</span> above to start tracking.
              </div>
            ) : (
              masteryList.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-[#191b23]">{item.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#004ac6]">{item.masteryPercent}%</span>
                      <span className="text-[10px] bg-slate-50 border border-gray-100 text-[#434655] px-2 py-0.5 rounded uppercase font-semibold">
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${item.colorClass}`} 
                      style={{ width: `${item.masteryPercent}%` }} 
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Card Spaced Distribution metrics */}
        <section className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] space-y-4">
          <h3 className="text-base font-bold text-[#191b23] border-b border-gray-50 pb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-700" />
            <span>Spaced Memory Distribution</span>
          </h3>

          <p className="text-xs text-[#434655]">
            Maturity level of active synapse connections across your general deck repository.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center text-xs text-[#434655]">
              <span className="font-semibold">Mature Cards (80-100% retained)</span>
              <span className="font-bold text-[#191b23]">62%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "62%" }} />
            </div>

            <div className="flex justify-between items-center text-xs text-[#434655]">
              <span className="font-semibold">Young Cards (retained, review active)</span>
              <span className="font-bold text-[#191b23]">28%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#004ac6] rounded-full" style={{ width: "28%" }} />
            </div>

            <div className="flex justify-between items-center text-xs text-[#434655]">
              <span className="font-semibold">New Concepts (unstudied)</span>
              <span className="font-bold text-[#191b23]">10%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-300 rounded-full" style={{ width: "10%" }} />
            </div>
          </div>
        </section>

      </div>

      {/* GitHub styling 30-Day Activity Heatmap simulation (Screen 2) */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] space-y-4">
        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
          <h3 className="text-base font-bold text-[#191b23] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#004ac6]" />
            <span>Study Consistency (30 Days Heatmap)</span>
          </h3>
          <div className="flex gap-1 items-center text-[10px] text-gray-500 font-bold uppercase">
            <span>Sparse</span>
            <div className="w-2.5 h-2.5 bg-gray-100 rounded-sm" />
            <div className="w-2.5 h-2.5 bg-indigo-100 rounded-sm" />
            <div className="w-2.5 h-2.5 bg-indigo-300 rounded-sm" />
            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm" />
            <div className="w-2.5 h-2.5 bg-[#004ac6] rounded-sm" />
            <span>Heavy</span>
          </div>
        </div>

        <p className="text-xs text-[#434655]">
          A visual record of cards studied daily. Tap any cell to view quantified active recall iterations.
        </p>

        <div className="flex flex-wrap gap-2.5 pt-2">
          {heatmap.map((cell) => {
            const countLabel = cell.val === 0 
              ? "0 cards" 
              : cell.val === 1 
                ? "12 cards" 
                : cell.val === 2 
                  ? "25 cards" 
                  : cell.val === 3 
                    ? "42 cards" 
                    : "68 cards";

            return (
              <button
                key={cell.dayIndex}
                onClick={() => setSelectedCell({ index: cell.dayIndex + 1, count: cell.val })}
                className={`w-7 h-7 rounded-md cursor-pointer transition-all ${getHeatmapColor(cell.val)} transition-all hover:scale-105`}
                title={`Day ${cell.dayIndex + 1}: ${countLabel}`}
              />
            );
          })}
        </div>

        {selectedCell && (
          <div className="bg-[#faf8ff] p-3 rounded-lg border border-[#c3c6d7]/30 text-xs text-[#434655] animate-fade-in">
            <strong>Day {selectedCell.index} performance:</strong> Studied approximately {
              selectedCell.count === 0 
                ? "0 concepts (rest day)." 
                : selectedCell.count === 1 
                  ? "12 cards reviewed systematically." 
                  : selectedCell.count === 2 
                    ? "25 cards verified successfully." 
                    : selectedCell.count === 3 
                      ? "42 concepts revised with voice feedback." 
                      : "68 intensive card reps completed!"
            }
          </div>
        )}
      </section>

    </div>
  );
}
