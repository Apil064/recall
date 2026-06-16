import { useState, useEffect } from "react";
import { ArrowLeft, Check, RotateCcw, Award, AlertTriangle, AlertCircle } from "lucide-react";
import { Deck, Flashcard } from "../types";

interface QuizSessionProps {
  deck: Deck;
  onBack: () => void;
  onQuizCompleted: (scorePercentage: number) => void;
}

interface QuizQuestion {
  cardId: string;
  question: string;
  correctAnswer: string;
  allChoices: string[];
}

export default function QuizSession({ deck, onBack, onQuizCompleted }: QuizSessionProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Initialize multiple-choice questions using current deck cards and other cards as distractors
  useEffect(() => {
    if (deck.cards.length === 0) return;

    const allDeckAnswers = deck.cards.map((c) => c.answer);
    const standardDistractors = [
      "Adenosine triphosphate (ATP) via cellular respiration inside the eukaryotic inner membrane and matrix.",
      "The tendency of an organism or cell to maintain a constant balanced internal state despite changes in external parameters.",
      "A molecular bond formed by sharing electrons between elements with similar electronegativities.",
      "The study of phonemes and linguistic rules that govern how sounds sequence in systemic linguistics."
    ];

    const generated = deck.cards.map((card) => {
      // Pick 3 options from other cards or standard fallback distractors
      const pool = Array.from(new Set([...allDeckAnswers.filter((a) => a !== card.answer), ...standardDistractors]));
      // Shuffle distressors
      const distractors = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
      const choices = [card.answer, ...distractors].sort(() => 0.5 - Math.random());

      return {
        cardId: card.id,
        question: card.question,
        correctAnswer: card.answer,
        allChoices: choices,
      };
    });

    setQuestions(generated);
  }, [deck]);

  if (deck.cards.length < 2) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-5 pt-12 pb-28 text-center font-sans">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-[#004ac6] mx-auto animate-bounce" />
          <h2 className="text-xl font-bold">More Cards Needed</h2>
          <p className="text-xs text-[#434655]">
            Practice Quizzes require a deck containing at least 2 cards to pull dynamic choices and distraction answers.
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

  const currentQ = questions[currentIndex];

  const handleChoiceSelect = (choice: string) => {
    if (isAnswered) return;
    setSelectedChoice(choice);
  };

  const handleVerify = () => {
    if (!selectedChoice || isAnswered) return;
    setIsAnswered(true);

    if (selectedChoice === currentQ.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedChoice(null);
    setIsAnswered(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCompleted(true);
      const finalPercent = Math.round((score / questions.length) * 100);
      onQuizCompleted(finalPercent);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedChoice(null);
    setIsAnswered(false);
    setScore(0);
    setCompleted(false);
  };

  return (
    <div className="w-full max-w-[700px] mx-auto px-5 pt-4 pb-28 space-y-6 font-sans">
      
      {/* Top Header progress */}
      <div className="flex justify-between items-center h-12">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#434655] bg-white border border-[#c3c6d7]/30 px-3 py-1.5 rounded-lg active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Quiz</span>
        </button>

        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          Problem {completed ? questions.length : currentIndex + 1} of {questions.length}
        </span>
      </div>

      {!completed && currentQ ? (
        <div className="space-y-6">
          
          {/* Progress bar */}
          <div className="w-full h-2 bg-[#2563eb]/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-600 transition-all duration-300" 
              style={{ width: `${(currentIndex / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Stem Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3 text-left">
            <span className="text-[10px] font-black uppercase text-[#004ac6] tracking-wider">
              Question Prompt
            </span>
            <p className="text-base md:text-lg font-bold text-[#191b23] leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* Answer Choice list */}
          <div className="space-y-3">
            {currentQ.allChoices.map((choice, i) => {
              const isSelected = selectedChoice === choice;
              const isCorrect = choice === currentQ.correctAnswer;
              
              let choiceStyle = "bg-white border-[#c3c6d7]/40 text-[#434655] hover:border-[#004ac6]/40";
              if (isSelected && !isAnswered) {
                choiceStyle = "bg-[#2563eb]/10 border-[#004ac6] text-[#004ac6] font-semibold";
              } else if (isAnswered) {
                if (isCorrect) {
                  choiceStyle = "bg-emerald-50 border-emerald-500 text-teal-800 font-bold";
                } else if (isSelected && !isCorrect) {
                  choiceStyle = "bg-red-50 border-red-500 text-red-800 font-medium";
                } else {
                  choiceStyle = "bg-white opacity-60 border-gray-200 text-gray-400";
                }
              }

              return (
                <button
                  key={i}
                  disabled={isAnswered}
                  onClick={() => handleChoiceSelect(choice)}
                  className={`w-full p-4 rounded-xl border text-left text-xs md:text-sm transition-all duration-200 flex items-start gap-3 cursor-pointer ${choiceStyle}`}
                >
                  <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="leading-relaxed">{choice}</span>
                </button>
              );
            })}
          </div>

          {/* Verification buttons */}
          <div className="pt-2 text-right">
            {!isAnswered ? (
              <button
                disabled={!selectedChoice}
                onClick={handleVerify}
                className={`h-11 px-6 font-bold text-xs rounded-xl transition-all cursor-pointer ${
                  selectedChoice 
                    ? "bg-[#004ac6] text-white hover:bg-[#2563eb] shadow-md shadow-[#004ac6]/10" 
                    : "bg-[#e1e2ed] text-gray-400 cursor-not-allowed"
                }`}
              >
                Verify Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="h-11 px-6 bg-[#004ac6] text-white font-extrabold text-xs rounded-xl hover:bg-[#2563eb] transition-all cursor-pointer shadow-md"
              >
                {currentIndex + 1 < questions.length ? "Next Question" : "Finish Quiz"}
              </button>
            )}
          </div>

        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-md text-center space-y-6 animate-scale-up">
          <div className="w-20 h-20 bg-emerald-50 text-teal-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#191b23]">Quiz Completed!</h2>
            <p className="text-xs text-[#434655] max-w-sm mx-auto leading-relaxed">
              Fantastic results! You answered <span className="font-bold">{score} out of {questions.length}</span> questions correctly. Your recall networks are adapting actively.
            </p>
          </div>

          {/* Final visual score meter */}
          <div className="max-w-xs mx-auto p-4 bg-[#faf8ff] border border-gray-100 rounded-xl space-y-1">
            <div className="text-xs font-bold text-[#737686] uppercase">Correct Answer Accuracy</div>
            <div className="text-4xl font-extrabold text-[#004ac6]">{Math.round((score / questions.length) * 100)}%</div>
          </div>

          <div className="flex gap-3 justify-center max-w-sm mx-auto">
            <button
              onClick={restartQuiz}
              className="flex-1 h-11 border border-[#c3c6d7] rounded-xl text-xs font-extrabold text-[#434655] hover:bg-[#faf8ff] active:scale-95 cursor-pointer flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Practice</span>
            </button>

            <button
              onClick={onBack}
              className="flex-1 h-11 bg-[#004ac6] text-white rounded-xl text-xs font-extrabold hover:bg-[#2563eb] active:scale-95 cursor-pointer flex items-center justify-center gap-1 shadow-md"
            >
              <span>Back to Deck</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
