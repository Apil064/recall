import React, { useState } from "react";
import { UserProfile, ActiveView } from "../types";
import { Shield, Key, Bell, Sliders, LogOut, CheckCircle, RotateCcw, Lock } from "lucide-react";

interface SettingsProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onLogout: () => void;
}

export default function Settings({ user, onUpdateUser, onLogout }: SettingsProps) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [toast, setToast] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      bio,
    });
    setToast("Profile settings successfully updated!");
    setTimeout(() => setToast(""), 4000);
  };

  const toggleProState = () => {
    onUpdateUser({
      ...user,
      isPro: !user.isPro,
    });
    setToast(user.isPro ? "Returned to Basic tier." : "Upgraded to Recall Academic Pro successfully!");
    setTimeout(() => setToast(""), 4000);
  };

  const toggleGoogleCal = () => {
    onUpdateUser({
      ...user,
      linkedGoogle: !user.linkedGoogle,
    });
    setToast(user.linkedGoogle ? "Google Calendar link suspended." : "Google Calendar sync active! Upcoming exams will auto-populate.");
    setTimeout(() => setToast(""), 4000);
  };

  return (
    <div className="w-full max-w-[800px] mx-auto px-5 pt-4 pb-28 space-y-6 font-sans text-left animate-fade-in">
      
      {/* Title */}
      <h2 className="text-xl font-bold text-[#191b23] border-b border-gray-100 pb-2">
        Recall System Configurations
      </h2>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-xs text-teal-800 font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Edit Profile Form */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] text-left">
        <form onSubmit={handleSave} className="space-y-4">
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest border-b border-gray-50 pb-2">Academic Profile</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#434655] mb-2 uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                required
                className="w-full h-11 px-4 bg-[#f3f3fe] border border-transparent rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-[#004ac6] text-[#191b23]"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#434655] mb-2 uppercase tracking-wide">Primary Academic Role</label>
              <input
                type="text"
                disabled
                className="w-full h-11 px-4 bg-gray-100 border border-transparent rounded-lg text-xs cursor-not-allowed text-gray-500"
                value={user.role}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#434655] mb-2 uppercase tracking-wide">Personal Learning Bio statement</label>
            <textarea
              rows={3}
              className="w-full p-4 bg-[#f3f3fe] border border-transparent rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-[#004ac6] resize-none text-[#191b23]"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="px-5 h-11 bg-[#004ac6] text-white text-xs font-bold rounded-lg hover:bg-[#2563eb] cursor-pointer shadow-md shadow-[#004ac6]/10"
            >
              Update Profile Details
            </button>
          </div>
        </form>
      </section>

      {/* Cloud Integration toggles (Screen 5: Google, etc) */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] space-y-4">
        <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest border-b border-gray-50 pb-2">Third-party integrations</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#191b23]">Google Workspace Calendar Sync</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">Auto-populate exams, due dates, & practice schedules on Google Calendar.</p>
            </div>
            
            <button
              onClick={toggleGoogleCal}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black cursor-pointer transition-colors ${
                user.linkedGoogle 
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                  : "bg-gray-100 text-[#434655] hover:bg-gray-200"
              }`}
            >
              {user.linkedGoogle ? "✓ Linked" : "Connect Google"}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#191b23]">Academic Pro Subscription Tier</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">Toggle Premium pro vectors, unlimited cards, and direct server connections.</p>
            </div>

            <button
              onClick={toggleProState}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black cursor-pointer transition-colors ${
                user.isPro 
                  ? "bg-indigo-50 text-indigo-800 border border-indigo-100" 
                  : "bg-gray-100 text-[#434655] hover:bg-gray-200"
              }`}
            >
              {user.isPro ? "✓ Pro Member" : "Activate Pro Trial"}
            </button>
          </div>
        </div>
      </section>

      {/* System Security */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-[#191b23]">Device Authorization</h4>
          <p className="text-[10px] text-gray-500">Secure end-to-end token session. Registered browser instance.</p>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 border border-[#ba1a1a]/20 bg-red-50 text-[#ba1a1a] hover:bg-[#ba1a1a]/10 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Account</span>
        </button>
      </section>

    </div>
  );
}
