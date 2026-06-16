import { useEffect } from "react";
import { BookOpen } from "lucide-react";

interface SplashProps {
  onDismiss: () => void;
}

export default function Splash({ onDismiss }: SplashProps) {
  useEffect(() => {
    // Automatically transition past the splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <main className="relative h-screen w-full flex flex-col items-center justify-between overflow-hidden bg-[#faf8ff] selection:bg-primary-container selection:text-white">
      {/* Background Animated Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#004ac6]/10 via-[#faf8ff] to-[#faf8ff] pointer-events-none" />
      </div>

      {/* Center Branding & Logo Section */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 px-5 text-center">
        <div className="relative mb-6">
          {/* Outer Ring Glow */}
          <div className="absolute -inset-6 bg-[#004ac6]/20 blur-3xl rounded-full" />
          
          {/* Logo Container */}
          <div className="relative w-24 h-24 bg-[#004ac6] rounded-[24px] shadow-2xl flex items-center justify-center overflow-hidden">
            <BookOpen className="w-12 h-12 text-white animate-pulse" />
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-1">
          <h1 className="font-sans text-4xl md:text-5xl font-bold text-[#004ac6] tracking-tight">Recall</h1>
          <p className="font-sans text-sm md:text-base text-[#434655] max-w-[280px] leading-relaxed">
            Elevating knowledge retention for the modern professional.
          </p>
        </div>

        {/* Loading State */}
        <div className="mt-8 w-48 h-[4px] bg-[#e7e7f3] rounded-full overflow-hidden">
          <div className="h-full bg-[#004ac6] w-2/3 rounded-full animate-[shimmer_2s_infinite_linear] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
      </div>

      {/* Bottom Branding Anchor */}
      <footer className="pb-8 w-full flex flex-col items-center z-10">
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="material-symbols-outlined text-[18px] text-[#434655]">school</span>
          <span className="font-sans text-xs font-bold text-[#434655] tracking-widest uppercase">Academic Intelligence</span>
        </div>
        <div className="mt-2">
          <span className="font-sans text-xs text-[#737686]">v2.4.0 • Secure Session</span>
        </div>
      </footer>

      {/* Optional Atmospheric Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />
    </main>
  );
}
