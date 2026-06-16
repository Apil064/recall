import { useState } from "react";
import { ArrowLeft, Check, RotateCcw, AlertTriangle, Sparkles, Award } from "lucide-react";
import { Deck, Flashcard } from "../types";

interface StudySessionProps {
  deck: Deck;
  onBack: () => void;
  onCardReviewed: (scoreChange: number) => void;
}

export default function StudySession({ deck, onBack, onCardReviewed }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [scoreAccumulator, setScoreAccumulator] = useState(0);

  const cards = deck.cards;
  const totalCards = cards.length;

  if (totalCards === 0) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-5 pt-12 pb-28 text-center font-sans space-y-6">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold">No Cards Available to Study</h2>
          <p className="text-xs text-[#434655]">
            This deck does not contain any cards. Use the notes importer to fill this deck with memory-efficient cards or write them custom.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-[#004ac6] text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Back to Deck
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleRating = (difficulty: "again" | "hard" | "good" | "easy") => {
    let score = 2; // general default increments
    if (difficulty === "again") score = 0;
    if (difficulty === "hard") score = 1;
    if (difficulty === "good") score = 4;
    if (difficulty === "easy") score = 7;

    setScoreAccumulator((prev) => prev + score);
    onCardReviewed(score);

    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex + 1 < totalCards) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setSessionCompleted(true);
      }
    }, 200);
  };

  const restartSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setScoreAccumulator(0);
  };

  return (
    <div className="w-full max-w-[650px] mx-auto px-5 pt-4 pb-28 space-y-6 font-sans">
      
      {/* Top bar with progress indicator */}
      <div className="flex justify-between items-center h-12">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#434655] bg-white border border-[#c3c6d7]/30 px-3 py-1.5 rounded-lg active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Study</span>
        </button>

        <span className="text-xs font-black text-[#004ac6] bg-[#2563eb]/10 px-3 py-1 rounded-full">
          Card {sessionCompleted ? totalCards : currentIndex + 1} / {totalCards}
        </span>
      </div>

      {!sessionCompleted ? (
        <div className="space-y-6">
          
          {/* Progress bar */}
          <div className="w-full h-2 bg-[#2563eb]/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#004ac6] transition-all duration-300" 
              style={{ width: `${((currentIndex) / totalCards) * 100}%` }}
            />
          </div>

          {/* Interactive perspective FLIP Card container */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[350px] bg-white rounded-3xl border border-gray-100 shadow-[0px_4px_32px_rgba(0,0,0,0.06)] relative overflow-hidden flex flex-col justify-between p-8 cursor-pointer select-none group transition-all hover:shadow-[0px_8px_36px_rgba(0,0,0,0.1)] active:scale-[0.99] duration-300"
          >
            {/* Soft decorative background tags */}
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#737686]">
                {deck.name} • {currentCard.category}
              </span>
              <span className="text-[10px] font-bold text-[#004ac6] uppercase bg-[#2563eb]/5 px-2 py-0.5 rounded">
                {isFlipped ? "Answer View" : "Active Recall Prompt"}
              </span>
            </div>

            {/* Central typography statement */}
            <div className="flex-1 flex items-center justify-center py-6 text-center">
              {!isFlipped ? (
                <p className="text-lg md:text-xl font-bold text-[#191b23] leading-relaxed max-w-md">
                  {currentCard.question}
                </p>
              ) : (
                <p className="text-sm md:text-base text-[#434655] leading-relaxed max-w-md font-medium text-left">
                  {currentCard.answer}
                </p>
              )}
            </div>

            {/* Tap instruction trigger helper */}
            <div className="text-center pt-4 border-t border-gray-50 text-[10px] font-bold text-[#737686] uppercase tracking-wide group-hover:text-[#004ac6] transition-colors">
              {!isFlipped ? "Tap card face to view answer" : "Tap card face to return to prompt"}
            </div>
          </div>

          {/* Confidences & spaced repetition choices */}
          {isFlipped && (
            <div className="grid grid-cols-4 gap-2 animate-slide-up bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <button
                onClick={() => handleRating("again")}
                className="flex flex-col items-center justify-center p-3 bg-white border border-[#ba1a1a]/10 hover:bg-red-50 text-[#ba1a1a] rounded-xl cursor-pointer transition-colors active:scale-95"
              >
                <div className="text-lg font-black">Again</div>
                <div className="text-[9px] font-semibold text-gray-500 uppercase mt-0.5">Incorrect</div>
              </button>

              <button
                onClick={() => handleRating("hard")}
                className="flex flex-col items-center justify-center p-3 bg-white border border-amber-500/10 hover:bg-amber-50 text-amber-600 rounded-xl cursor-pointer transition-colors active:scale-95"
              >
                <div className="text-lg font-black">Hard</div>
                <div className="text-[9px] font-semibold text-gray-500 uppercase mt-0.5">Struggled</div>
              </button>

              <button
                onClick={() => handleRating("good")}
                className="flex flex-col items-center justify-center p-3 bg-white border border-[#004ac6]/10 hover:bg-[#2563eb]/10 text-[#004ac6] rounded-xl cursor-pointer transition-colors active:scale-95"
              >
                <div className="text-lg font-black">Good</div>
                <div className="text-[9px] font-semibold text-gray-500 uppercase mt-0.5">Recalled</div>
              </button>

              <button
                onClick={() => handleRating("easy")}
                className="flex flex-col items-center justify-center p-3 bg-white border border-teal-500/10 hover:bg-teal-50 text-teal-600 rounded-xl cursor-pointer transition-colors active:scale-95"
              >
                <div className="text-lg font-black">Easy</div>
                <div className="text-[9px] font-semibold text-gray-500 uppercase mt-0.5">Instant</div>
              </button>
            </div>
          )}

        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-md text-center space-y-6 animate-scale-up">
          <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#191b23]">Session Finished!</h2>
            <p className="text-xs text-[#434655] max-w-sm mx-auto leading-relaxed">
              Wonderful job! You have fully processed all {totalCards} cards. Brain consolidation and synapses have updated positively.
            </p>
          </div>

          {/* Core score achievements */}
          <div className="grid grid-cols-2 gap-4 bg-[#faf8ff] p-4 rounded-xl max-w-sm mx-auto border border-gray-100 text-left">
            <div>
              <div className="text-xs text-[#737686] font-bold uppercase">Estimated Mastery</div>
              <div className="text-lg font-extrabold text-[#191b23]">+{Math.min(10, Math.round(scoreAccumulator / 2))}% increment</div>
            </div>
            <div>
              <div className="text-xs text-[#737686] font-bold uppercase">Consolidation pts</div>
              <div className="text-lg font-extrabold text-teal-600">+{scoreAccumulator} CP</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center max-w-sm mx-auto">
            <button
              onClick={restartSession}
              className="flex-1 h-11 border border-[#c3c6d7] rounded-xl text-xs font-extrabold text-[#434655] hover:bg-[#faf8ff] active:scale-95 cursor-pointer flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Session</span>
            </button>

            <button
              onClick={onBack}
              className="flex-1 h-11 bg-[#004ac6] text-white rounded-xl text-xs font-extrabold hover:bg-[#2563eb] active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-[#004ac6]/10"
            >
              <span>Done</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
