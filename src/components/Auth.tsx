import React, { useState } from "react";
import { BookOpen, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useRecall } from "../RecallContext";

export default function Auth() {
  const { login, signup, isLoading, error: recallError } = useRecall();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isEmailView, setIsEmailView] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!email || !email.includes("@")) {
      setValidationError("Please specify a valid academic or professional email address.");
      return;
    }

    if (password.length < 6) {
      setValidationError("For secure session safety, password must represent at least 6 characters.");
      return;
    }

    if (isRegisterMode) {
      if (!name.trim()) {
        setValidationError("Please enter your name to personalize your study metrics.");
        return;
      }
      const success = await signup(email, name, password);
      if (!success) {
        // Errors are pre-handled by context states
      }
    } else {
      await login(email, password);
    }
  };

  // Google Login simulation using secure quick registers
  const handleGoogleMockLogin = async () => {
    // Uses the default configured student credentials preseeded in the file DB
    await login("alex.chen@academic.edu", "password123");
  };

  const displayError = validationError || recallError;

  return (
    <main className="flex-grow flex flex-col items-center justify-center min-h-screen px-5 py-8 max-w-[1200px] mx-auto w-full bg-[#faf8ff] dark:bg-[#0f111a] font-sans selection:bg-[#dbe1ff]">
      {/* Absolute Header */}
      <header className="absolute top-0 left-0 right-0 w-full h-[64px] flex justify-between items-center px-5 max-w-[1200px] mx-auto z-50">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#004ac6] dark:text-blue-400" />
          <span className="text-xl font-bold text-[#004ac6] dark:text-blue-400">Recall</span>
        </div>
      </header>

      <div className="w-full max-w-md flex flex-col items-center text-center space-y-6 animate-fade-in mt-16">
        {/* Welcome Illustration Container */}
        <div className="relative w-full aspect-square max-w-[200px] md:max-w-[250px] overflow-hidden rounded-2xl bg-[#f3f3fe] dark:bg-slate-900 flex items-center justify-center shadow-sm">
          <img
            alt="Learning and Growth Illustration"
            className="w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-700 hover:scale-105"
            referrerPolicy="no-referrer"
            src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop"
          />
          {/* Floating Micro-Interaction Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 right-4 bg-[#2563eb] text-white px-3 py-1 rounded-full shadow-lg flex items-center gap-2 animate-bounce" style={{ animationDuration: "3s" }}>
              <span className="text-xs font-semibold uppercase tracking-wider">AI Active</span>
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#191b23] dark:text-gray-100 tracking-tight">
            {isRegisterMode ? "Create an account" : "Welcome back."}
          </h1>
          <p className="text-sm text-[#434655] dark:text-gray-400 max-w-[300px] mx-auto leading-normal">
            Master complex sciences with AI-assisted spaced repetition & active recall.
          </p>
        </div>

        {/* Authentication Actions */}
        <div className="w-full space-y-4 pt-2">
          {displayError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200/30 text-[#ba1a1a] dark:text-red-300 text-xs font-semibold rounded-lg text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          {!isEmailView ? (
            <>
              {/* Google Sign-In Button */}
              <button
                onClick={handleGoogleMockLogin}
                className="w-full h-[52px] flex items-center justify-center gap-3 px-4 bg-white dark:bg-[#1a1f33] border border-[#c3c6d7] dark:border-slate-800 rounded-xl text-sm font-semibold text-[#191b23] dark:text-gray-200 hover:bg-[#f3f3fe] dark:hover:bg-slate-800 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue as pre-seeded Alex
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-1">
                <div className="h-[1px] flex-grow bg-[#c3c6d7] dark:bg-slate-800" />
                <span className="text-[10px] font-bold text-[#737686] uppercase tracking-widest text-muted">or</span>
                <div className="h-[1px] flex-grow bg-[#c3c6d7] dark:bg-slate-800" />
              </div>

              {/* Email Trigger (Secondary Style) */}
              <button
                onClick={() => setIsEmailView(true)}
                className="w-full h-[52px] px-4 bg-[#004ac6] text-white rounded-xl text-sm font-semibold hover:bg-[#2563eb] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-md shadow-[#004ac6]/10"
              >
                Sign in with Password
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-4 text-left p-6 bg-white dark:bg-[#151824] rounded-2xl border border-gray-100 dark:border-slate-800/80 shadow-[0px_4px_32px_rgba(0,0,0,0.03)]">
              {isRegisterMode && (
                <div>
                  <label className="block text-[10px] font-bold text-[#434655] dark:text-gray-400 mb-1.5 uppercase tracking-wider">Full name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-[46px] px-4 rounded-xl border border-[#c3c6d7] dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] dark:text-gray-100 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-[#434655] dark:text-gray-400 mb-1.5 uppercase tracking-wider">Email address</label>
                <input
                  type="email"
                  required
                  placeholder="name@academic.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[46px] px-4 rounded-xl border border-[#c3c6d7] dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] dark:text-gray-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#434655] dark:text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[46px] pl-4 pr-11 rounded-xl border border-[#c3c6d7] dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] dark:text-gray-100 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEmailView(false);
                    setValidationError("");
                  }}
                  className="flex-1 h-[46px] border border-[#c3c6d7] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#434655] dark:text-gray-400 font-semibold text-xs rounded-xl hover:bg-[#f3f3fe] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-[46px] bg-[#004ac6] text-white font-semibold text-xs rounded-xl hover:bg-[#2563eb] disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-[#004ac6]/10"
                >
                  {isLoading ? "Connecting..." : isRegisterMode ? "Register" : "Sign In"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Links */}
        <footer className="pt-8 w-full">
          <p className="text-xs text-[#434655] dark:text-gray-400">
            {isRegisterMode ? "Already verified?" : "First time studying on Recall?"}{" "}
            <span
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setValidationError("");
              }}
              className="text-[#004ac6] dark:text-blue-400 font-extrabold hover:underline cursor-pointer"
            >
              {isRegisterMode ? "Log In" : "Join Recall"}
            </span>
          </p>
          <div className="flex justify-center gap-6 mt-4 opacity-60 text-xs text-[#434655] dark:text-gray-400">
            <span className="hover:text-[#004ac6] dark:hover:text-blue-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#004ac6] dark:hover:text-blue-400 transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </footer>
      </div>

      {/* Background Subtle Textures */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#004ac6]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[80px]" />
      </div>
    </main>
  );
}
