import React from 'react';
import { History as HistoryIcon, Trash2, ChevronRight, Calendar, Clock, Activity } from 'lucide-react';
import { AnalysisSession } from '../domain/types';
import { motion } from 'motion/react';

interface HistoryViewProps {
  sessions: AnalysisSession[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  onSelect,
  onDelete,
  onNew
}) => {
  return (
    <div className="max-w-5xl mx-auto p-12 space-y-12 bg-[#0c0f14]">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">Review History</h1>
          <p className="text-slate-500 font-medium">Access your previous UX analysis sessions.</p>
        </div>
        <button
          onClick={onNew}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95"
        >
          New Analysis
        </button>
      </header>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-[#151922] border border-white/5 rounded-[2.5rem] space-y-8">
          <div className="p-8 bg-white/[0.02] rounded-full text-slate-700 border border-white/5">
            <HistoryIcon className="w-16 h-16" />
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">No sessions found</h3>
            <p className="text-slate-500 font-medium">Start your first UX review to see it here.</p>
          </div>
          <button
            onClick={onNew}
            className="px-8 py-3 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
          >
            Create Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-[#151922] border border-white/5 rounded-3xl p-8 hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.05)] transition-all cursor-pointer relative overflow-hidden"
              onClick={() => onSelect(session.id)}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-8">
                  <div className="flex -space-x-4">
                    {session.screens.slice(0, 3).map((screen, idx) => (
                      <div 
                        key={screen.id} 
                        className="w-14 h-14 rounded-xl border-2 border-[#151922] bg-[#0c0f14] overflow-hidden shadow-2xl"
                        style={{ zIndex: 3 - idx }}
                      >
                        <img src={screen.previewUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                    {session.screens.length > 3 && (
                      <div className="w-14 h-14 rounded-xl border-2 border-[#151922] bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-2xl z-0 uppercase tracking-widest">
                        +{session.screens.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors tracking-tight">
                      {session.screens[0]?.name || 'Untitled Session'} 
                      {session.screens.length > 1 && <span className="text-slate-600 ml-2">+{session.screens.length - 1} screens</span>}
                    </h3>
                    <div className="flex items-center gap-6 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-700" />
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-700" />
                        {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-slate-700" />
                        {session.issues.length} Issues
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                    session.overallHealth === 'critical' ? 'border-red-500/30 text-red-400' :
                    session.overallHealth === 'attention' ? 'border-amber-500/30 text-amber-400' :
                    'border-blue-500/30 text-blue-400'
                  }`}>
                    {session.overallHealth} Health
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(session.id);
                    }}
                    className="p-3 text-slate-700 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                </div>
              </div>
              
              {/* Subtle background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/[0.02] to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
