import React, { useState } from "react";
import { Search, Sliders, Play, Plus, BookOpen, MoreVertical, PlusCircle, Sparkles, Camera } from "lucide-react";
import { Deck, ActiveView } from "../types";

interface LibraryProps {
  decks: Deck[];
  setSelectedDeckId: (id: string | null) => void;
  setView: (view: ActiveView) => void;
  onCreateDeck: (name: string, category: string, description: string) => void;
}

export default function Library({ decks, setSelectedDeckId, setView, onCreateDeck }: LibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Decks");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckCategory, setNewDeckCategory] = useState("Biology");
  const [newDeckDesc, setNewDeckDescription] = useState("");

  const categories = ["All Decks", "Biology", "Algorithms", "Chemistry", "Japanese", "Languages"];

  const filteredDecks = decks.filter((deck) => {
    const matchesSearch = deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All Decks" || deck.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    onCreateDeck(newDeckName, newDeckCategory, newDeckDesc);
    setNewDeckName("");
    setNewDeckDescription("");
    setIsCreateOpen(false);
  };

  const handleDeckClick = (deckId: string) => {
    setSelectedDeckId(deckId);
    setView("deck-detail");
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-5 pt-4 pb-28 space-y-6 font-sans">
      
      {/* Top Search bar */}
      <section className="space-y-4">
        <div className="relative group">
          <input
            type="text"
            className="w-full h-[56px] bg-[#f3f3fe] border-none rounded-xl px-14 font-sans text-sm text-[#191b23] focus:ring-2 focus:ring-[#004ac6] transition-all outline-none"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#737686] group-focus-within:text-[#004ac6] transition-colors" />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#004ac6] transition-colors cursor-pointer">
            <Sliders className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide -mx-5 px-5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-6 py-2 rounded-full font-bold text-xs transition-colors cursor-pointer ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-[#004ac6] text-white shadow-sm"
                  : "bg-[#e1e2ed] text-[#434655] hover:bg-[#c3c6d7]/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* AI Compilation Pipelines */}
        <div className="grid grid-cols-2 gap-4 pt-1 animate-slide-up">
          <button 
            type="button"
            onClick={() => setView("import-notes")}
            className="flex items-center justify-center gap-2 p-3.5 bg-white border border-[#2563eb]/20 hover:border-[#004ac6] text-[#004ac6] font-bold rounded-xl hover:bg-[#2563eb]/5 transition-all cursor-pointer shadow-sm text-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Compile Notes</span>
          </button>
          <button 
            type="button"
            onClick={() => setView("ocr-import")}
            className="flex items-center justify-center gap-2 p-3.5 bg-white border border-[#2563eb]/20 hover:border-[#004ac6] text-[#004ac6] font-bold rounded-xl hover:bg-[#2563eb]/5 transition-all cursor-pointer shadow-sm text-xs"
          >
            <Camera className="w-4 h-4" />
            <span>Simulate OCR Scan</span>
          </button>
        </div>
      </section>

      {/* Sorting & Title */}
      <div className="flex justify-between items-end border-b border-gray-100 pb-2">
        <h2 className="text-xl font-extrabold text-[#191b23]">My Library</h2>
        <span className="text-xs font-bold text-[#737686] flex items-center gap-1">
          Recent Decks ({filteredDecks.length})
        </span>
      </div>

      {isCreateOpen && (
        <form onSubmit={handleCreateSubmit} className="bg-white border border-[#004ac6]/10 p-5 rounded-2xl space-y-4 shadow-md animate-fade-in text-left">
          <h3 className="text-sm font-bold text-[#004ac6] uppercase tracking-wider">Create New Flashcard Deck</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#434655] mb-2 uppercase">Deck Name</label>
              <input
                type="text"
                required
                className="w-full h-11 px-3 bg-[#f3f3fe] border border-[#c3c6d7]/30 rounded-lg text-xs outline-none focus:border-[#004ac6]"
                placeholder="e.g. Cognitive Science"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#434655] mb-2 uppercase">Category</label>
              <select
                className="w-full h-11 px-3 bg-[#f3f3fe] border border-[#c3c6d7]/30 rounded-lg text-xs outline-none focus:border-[#004ac6]"
                value={newDeckCategory}
                onChange={(e) => setNewDeckCategory(e.target.value)}
              >
                <option value="Biology">Biology</option>
                <option value="Algorithms">Algorithms</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Japanese">Japanese</option>
                <option value="languages">Languages</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#434655] mb-2 uppercase">Description</label>
            <textarea
              className="w-full p-3 bg-[#f3f3fe] border border-[#c3c6d7]/30 rounded-lg text-xs outline-none resize-none h-16 focus:border-[#004ac6]"
              placeholder="Summary explaining what standard finals material is covered by the deck..."
              value={newDeckDesc}
              onChange={(e) => setNewDeckDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border border-[#c3c6d7]/40 bg-white rounded-lg text-xs font-bold text-[#434655] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#004ac6] text-white rounded-lg text-xs font-bold hover:bg-[#2563eb] cursor-pointer shadow-sm"
            >
              Add Deck
            </button>
          </div>
        </form>
      )}

      {/* Bento Grid Library */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDecks.map((deck) => (
          <div
            key={deck.id}
            onClick={() => handleDeckClick(deck.id)}
            className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col justify-between h-[180px] relative overflow-hidden cursor-pointer hover:shadow-[0px_10px_32px_rgba(0,0,0,0.08)] hover:scale-[1.01] transition-all"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <span className="px-3 py-1 bg-[#6df5e1]/20 text-[#006f64] rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {deck.category}
                </span>
                <MoreVertical className="w-4 h-4 text-[#737686] group-hover:text-[#004ac6] transition-colors" />
              </div>
              <h3 className="font-sans text-base font-extrabold text-[#191b23] group-hover:text-[#004ac6] transition-colors">
                {deck.name}
              </h3>
              <p className="text-xs text-[#434655] mt-1 line-clamp-1">{deck.description}</p>
              <p className="text-xs font-semibold text-[#737686] mt-1">{deck.cards.length} Cards</p>
            </div>
            
            <div className="relative z-10 space-y-2 mt-4">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-[#434655]">Mastery</span>
                <span className="text-[#004ac6]">{deck.mastery}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#2563eb]/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#004ac6] rounded-full transition-all duration-500" 
                  style={{ width: `${deck.mastery}%` }} 
                />
              </div>
            </div>
          </div>
        ))}

        {/* Create New Deck Button (Dashed) */}
        {!isCreateOpen && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="group border-2 border-dashed border-[#c3c6d7] bg-transparent p-6 rounded-2xl flex flex-col items-center justify-center h-[180px] transition-all hover:border-[#004ac6] hover:bg-[#f3f3fe] active:scale-[0.98] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#2563eb]/10 text-[#004ac6] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-[#434655] group-hover:text-[#004ac6]">Create New Deck</span>
          </button>
        )}
      </section>

      {/* FAB for Quick Study */}
      <button 
        onClick={() => setView("study-session")}
        className="fixed right-6 bottom-24 w-[56px] h-[56px] bg-[#004ac6] text-white rounded-2xl shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform cursor-pointer"
        title="Quick Study session"
      >
        <Play className="w-5 h-5 fill-current" />
      </button>

    </div>
  );
}
