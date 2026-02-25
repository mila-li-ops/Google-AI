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
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">Review History</h1>
          <p className="text-slate-500">Access your previous UX analysis sessions.</p>
        </div>
        <button
          onClick={onNew}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          New Analysis
        </button>
      </header>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-3xl space-y-6">
          <div className="p-6 bg-slate-50 rounded-full text-slate-300">
            <HistoryIcon className="w-16 h-16" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-slate-900">No sessions found</h3>
            <p className="text-slate-500">Start your first UX review to see it here.</p>
          </div>
          <button
            onClick={onNew}
            className="px-6 py-2 border-2 border-slate-900 text-slate-900 rounded-lg font-bold hover:bg-slate-900 hover:text-white transition-all"
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
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50/50 transition-all cursor-pointer relative"
              onClick={() => onSelect(session.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {session.screens.slice(0, 3).map((screen, idx) => (
                      <div 
                        key={screen.id} 
                        className="w-12 h-12 rounded-lg border-2 border-white bg-slate-100 overflow-hidden shadow-sm"
                        style={{ zIndex: 3 - idx }}
                      >
                        <img src={screen.previewUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {session.screens.length > 3 && (
                      <div className="w-12 h-12 rounded-lg border-2 border-white bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-0">
                        +{session.screens.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {session.screens[0]?.name || 'Untitled Session'} 
                      {session.screens.length > 1 && ` + ${session.screens.length - 1} more`}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {session.issues.length} Issues
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    session.overallHealth === 'critical' ? 'bg-red-50 text-red-600 border-red-100' :
                    session.overallHealth === 'attention' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {session.overallHealth} Health
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(session.id);
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
