import React, { useState } from "react";
import { ScheduleItem, DeadlineItem } from "../types";
import { Calendar, CheckCircle, PlusCircle, AlertCircle, Clock, Trash2, Check, ArrowRight } from "lucide-react";

interface WeeklyPlanProps {
  schedule: ScheduleItem[];
  deadlines: DeadlineItem[];
  onToggleSchedule: (id: string) => void;
  onAddSchedule: (title: string, timeString: string, durationLabel: string, typeLabel: string) => void;
  onAddDeadline: (title: string, month: string, day: string, daysLeft: number, urgency: boolean) => void;
}

export default function WeeklyPlan({ 
  schedule, 
  deadlines, 
  onToggleSchedule, 
  onAddSchedule,
  onAddDeadline 
}: WeeklyPlanProps) {
  const [isAddSchOpen, setIsAddSchOpen] = useState(false);
  const [schTitle, setSchTitle] = useState("");
  const [schTime, setSchTime] = useState("");

  const [isAddDlOpen, setIsAddDlOpen] = useState(false);
  const [dlTitle, setDlTitle] = useState("");
  const [dlDay, setDlDay] = useState("");
  const [dlMonth, setDlMonth] = useState("OCT");

  const [completedDays, setCompletedDays] = useState<number[]>([1, 2, 4, 5, 8, 9, 12, 14, 15, 16, 20]);

  const handleSchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schTitle.trim() || !schTime.trim()) return;
    onAddSchedule(schTitle, schTime, "30 min", "Recall");
    setSchTitle("");
    setSchTime("");
    setIsAddSchOpen(false);
  };

  const handleDlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dlTitle.trim() || !dlDay.trim()) return;
    onAddDeadline(dlTitle, dlMonth, dlDay, 6, true);
    setDlTitle("");
    setDlDay("");
    setIsAddDlOpen(false);
  };

  const toggleDayCheck = (day: number) => {
    if (completedDays.includes(day)) {
      setCompletedDays(completedDays.filter((d) => d !== day));
    } else {
      setCompletedDays([...completedDays, day]);
    }
  };

  // Static list representing October calendar grid elements
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-5 pt-4 pb-28 space-y-6 font-sans text-left">
      
      {/* Daily Goal card tracker */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1 w-full md:w-auto">
          <span className="text-[10px] bg-emerald-50 text-teal-800 font-extrabold px-2.5 py-1 rounded-full uppercase">Goal Tracker</span>
          <h2 className="text-xl font-bold text-[#191b23] mt-2">Daily Goal Progress</h2>
          <p className="text-xs text-[#434655]">You've completed <span className="font-extrabold text-[#004ac6]">32 / 50</span> card reviews targeted for today.</p>
        </div>

        <div className="w-full md:w-2/3 flex items-center gap-4">
          <div className="flex-grow h-3 bg-gray-150 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "64%" }} />
          </div>
          <span className="text-xs font-black text-teal-800">64%</span>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Calendar Habit Tracker grid representation (Screen 2) */}
        <section className="md:col-span-12 lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#004ac6]" />
              <h3 className="text-base font-bold text-[#191b23]">Recall Monthly Streak Calendar</h3>
            </div>
            <span className="text-xs font-bold text-[#004ac6] uppercase">{dlMonth} 2026</span>
          </div>

          <p className="text-xs text-[#434655] leading-relaxed">
            Consistently practice each day to cement synapses. Click days on our interactive calendar grid to toggle completion states.
          </p>

          <div className="grid grid-cols-7 gap-2.5 text-center pt-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((wd) => (
              <span key={wd} className="text-[10px] font-black uppercase text-gray-400">{wd}</span>
            ))}

            {calendarDays.map((day) => {
              const isChecked = completedDays.includes(day);
              return (
                <button
                  key={day}
                  onClick={() => toggleDayCheck(day)}
                  className={`aspect-square rounded-xl flex items-center justify-center font-bold text-xs select-none cursor-pointer transition-all ${
                    isChecked 
                      ? "bg-[#004ac6] text-white font-extrabold shadow-sm scale-102" 
                      : "bg-[#faf8ff] text-[#434655] hover:bg-[#e1e2ed] border border-transparent"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </section>

        {/* Schedule List & Form */}
        <section className="md:col-span-12 lg:col-span-5 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-base font-bold text-[#191b23]">Today's Schedule</h3>
              <button
                onClick={() => setIsAddSchOpen(!isAddSchOpen)}
                className="text-xs font-bold text-[#004ac6] hover:underline cursor-pointer flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Plan task</span>
              </button>
            </div>

            {isAddSchOpen && (
              <form onSubmit={handleSchSubmit} className="bg-[#faf8ff] p-4 rounded-xl border border-gray-100 space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Task Name (e.g. Physiology final prep)"
                  className="w-full text-xs p-2 bg-white rounded border border-[#c3c6d7]/50"
                  value={schTitle}
                  onChange={(e) => setSchTitle(e.target.value)}
                />
                <input
                  type="time"
                  required
                  className="w-full text-xs p-2 bg-white rounded border border-[#c3c6d7]/50"
                  value={schTime}
                  onChange={(e) => setSchTime(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddSchOpen(false)}
                    className="px-2.5 py-1 border border-[#c3c6d7] text-[#434655] text-[10px] font-bold rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-[#004ac6] text-white text-[10px] font-bold rounded"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {schedule.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                    item.completed 
                      ? "bg-slate-50 border-gray-150 text-gray-400 line-through" 
                      : "bg-white border-gray-100 text-[#191b23]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleSchedule(item.id)}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                        item.completed 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : "border-[#c3c6d7] bg-white text-transparent hover:border-[#004ac6]"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <div>
                      <h4 className="text-xs font-bold font-sans">{item.title}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#737686] mt-0.5 font-sans">
                        <Clock className="w-3 h-3" />
                        <span>{item.timeString} • {item.durationLabel} ({item.typeLabel})</span>
                      </div>
                    </div>
                  </div>

                  {!item.completed && (
                    <button
                      onClick={() => onToggleSchedule(item.id)}
                      className="px-2.5 h-7 bg-[#2563eb]/10 text-[#004ac6] text-[10px] font-black rounded-lg hover:bg-[#2563eb]/20 cursor-pointer"
                    >
                      Complete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Academic Deadlines deadlines list */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-base font-bold text-[#191b23]">Upcoming Milestones</h3>
              <button
                onClick={() => setIsAddDlOpen(!isAddDlOpen)}
                className="text-xs font-bold text-[#004ac6] hover:underline cursor-pointer flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add deadline</span>
              </button>
            </div>

            {isAddDlOpen && (
              <form onSubmit={handleDlSubmit} className="bg-[#faf8ff] p-4 rounded-xl border border-gray-100 space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Exam title (e.g. Chem lab midterm)"
                  className="w-full text-xs p-2 bg-white rounded border border-[#c3c6d7]/50"
                  value={dlTitle}
                  onChange={(e) => setDlTitle(e.target.value)}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Day (e.g. 28)"
                    className="w-1/2 text-xs p-2 bg-white rounded border border-[#c3c6d7]/50"
                    value={dlDay}
                    onChange={(e) => setDlDay(e.target.value)}
                  />
                  <select
                    className="w-1/2 text-xs p-2 bg-white rounded border border-[#c3c6d7]/50"
                    value={dlMonth}
                    onChange={(e) => setDlMonth(e.target.value)}
                  >
                    <option value="OCT">OCT</option>
                    <option value="NOV">NOV</option>
                    <option value="DEC">DEC</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddDlOpen(false)}
                    className="px-2.5 py-1 border border-[#c3c6d7] text-[#434655] text-[10px] font-bold rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-[#004ac6] text-white text-[10px] font-bold rounded"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {deadlines.map((dl) => (
                <div key={dl.id} className="flex gap-4 items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="bg-[#f3f3fe] text-[#004ac6] p-2.5 rounded-xl text-center min-w-[50px] shrink-0 border border-indigo-50">
                    <div className="text-[9px] font-bold uppercase tracking-wider">{dl.month}</div>
                    <div className="text-base font-black leading-none">{dl.day}</div>
                  </div>

                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-bold text-[#191b23] truncate">{dl.title}</h4>
                    <p className={`text-[10px] font-semibold mt-0.5 uppercase ${dl.isUrgent ? "text-orange-600 animate-pulse" : "text-gray-500"}`}>
                      {dl.daysLeft} Days left • {dl.isUrgent ? "Urgent Review" : "In schedule"}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-xs font-extrabold text-[#191b23]">{dl.progressPercent}%</div>
                    <div className="text-[9px] font-semibold text-[#737686] uppercase tracking-wider">Prepared</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>
      </div>

    </div>
  );
}
