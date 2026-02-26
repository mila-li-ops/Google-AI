"use client";

import React, { useState, useEffect } from "react";
import { useAnalysis } from "./hooks/useAnalysis";
import { SetupFlow } from "./components/SetupFlow";
import { ProgressScreen } from "./components/ProgressScreen";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { HistoryView } from "./components/HistoryView";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LayoutGrid, History, PlusCircle, Sparkles, Home, ChevronRight, Activity, Clock, ShieldCheck, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ViewState = 'dashboard' | 'editor' | 'history';

export default function App() {
  const {
    sessions,
    currentSession,
    loading,
    error,
    createNewSession,
    updateSession,
    startAnalysis,
    selectSession,
    deleteSession,
    updateIssueStatus,
    setError
  } = useAnalysis();

  const [view, setView] = useState<ViewState>('dashboard');
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Test comment

  // Automatically clear toast after 3s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Automatically switch to editor when a session is created or selected
  useEffect(() => {
    if (currentSession && view !== 'editor') {
      setView('editor');
    }
  }, [currentSession?.id]);

  const handleNewSession = () => {
    createNewSession();
    setView('editor');
  };

  const handleSelectHistory = (id: string) => {
    selectSession(id);
    setView('editor');
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessionToDelete(id);
  };

  const executeDelete = () => {
    if (sessionToDelete) {
      const success = deleteSession(sessionToDelete);
      if (success) {
        setToast("Review deleted");
        if (view === 'editor' && currentSession?.id === sessionToDelete) {
          setView('dashboard');
        }
      }
      setSessionToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0f14] font-sans text-slate-200 selection:bg-blue-500/30 selection:text-blue-200 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content Area */}
      <main className="min-h-screen relative z-10">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-5xl mx-auto p-12 space-y-12"
              >
                <header className="flex items-end justify-between border-b border-white/5 pb-8">
                  <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-white">UX Pre-Handoff Review</h1>
                    <p className="text-slate-500 text-sm font-medium">Review your screens before development.</p>
                  </div>
                  <button 
                    onClick={handleNewSession}
                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-600/20 hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Start New Review
                  </button>
                </header>

                {sessions.find(s => s.state !== 'completed') && (
                  <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-1/3 animate-[shimmer_2s_infinite]" />
                  </div>
                )}

                <div className="space-y-16">
                  <section className="space-y-6">
                    <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Current Focus</h2>
                    {sessions.find(s => s.state !== 'completed') ? (
                      (() => {
                        const active = sessions.find(s => s.state !== 'completed')!;
                        const criticalCount = active.issues.filter(i => i.severity === 'critical').length;
                        const attentionCount = active.issues.filter(i => i.severity === 'attention').length;
                        return (
                          <div className="p-10 bg-[#151922] border border-white/5 rounded-[2rem] shadow-2xl shadow-black/50 flex items-center justify-between group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />
                            <div className="space-y-8 relative z-10">
                              <div className="space-y-4">
                                <h3 className="text-3xl font-bold text-white tracking-tight">{active.screens[0]?.name || 'Untitled Review'}</h3>
                                <div className="flex gap-3">
                                  <span className="text-[9px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded uppercase tracking-widest">{criticalCount} Critical</span>
                                  <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded uppercase tracking-widest">{attentionCount} Attention</span>
                                </div>
                              </div>
                              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                                <li className="flex items-center gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                  AI analysis in progress or pending review
                                </li>
                                <li className="flex items-center gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                  Focusing on {active.options.accessibilityFocus ? 'accessibility' : 'general UX'} patterns
                                </li>
                              </ul>
                              <div className="flex gap-4">
                                <button 
                                  onClick={() => handleSelectHistory(active.id)}
                                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 hover:scale-[1.02] transition-all flex items-center gap-2 shadow-2xl shadow-blue-600/20"
                                >
                                  Continue Review
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => confirmDelete(e, active.id)}
                                  className="px-4 py-4 bg-white/5 border border-white/10 text-slate-500 rounded-xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
                                  title="Delete Review"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="hidden md:block w-80 h-56 bg-black/40 rounded-2xl border border-white/5 overflow-hidden relative group-hover:border-white/10 transition-colors">
                               <img 
                                 src={active.screens[0]?.previewUrl || 'https://picsum.photos/seed/focus/400/300'} 
                                 className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" 
                                 referrerPolicy="no-referrer" 
                               />
                               <div className="absolute inset-0 bg-gradient-to-t from-[#151922] via-transparent to-transparent" />
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="p-20 bg-[#151922] border border-white/5 rounded-[2rem] flex flex-col items-center text-center space-y-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
                        <div className="space-y-3">
                          <h3 className="text-2xl font-bold text-white tracking-tight">No active review</h3>
                          <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">Start a new session to begin your automated UX audit.</p>
                        </div>
                        <div className="flex gap-4">
                          <button 
                            onClick={handleNewSession}
                            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 hover:scale-[1.02] transition-all shadow-2xl shadow-blue-600/20"
                          >
                            Start New Review
                          </button>
                          <button className="px-8 py-4 bg-white/5 border border-white/10 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">
                            View example
                          </button>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Recent Reviews</h2>
                      <button onClick={() => setView('history')} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">View All</button>
                    </div>
                    <div className="bg-[#151922] border border-white/5 rounded-2xl divide-y divide-white/5 overflow-hidden shadow-2xl shadow-black/20">
                      {sessions.filter(s => s.state === 'completed').slice(0, 5).map((session) => {
                        const critical = session.issues.filter(i => i.severity === 'critical').length;
                        const attention = session.issues.filter(i => i.severity === 'attention').length;
                        
                        return (
                          <div 
                            key={session.id}
                            onClick={() => handleSelectHistory(session.id)}
                            className="p-6 flex items-center justify-between group cursor-pointer hover:bg-white/[0.02] transition-all"
                          >
                            <div className="flex items-center gap-6">
                              <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/5 overflow-hidden">
                                <img 
                                  src={session.screens[0]?.previewUrl || 'https://picsum.photos/seed/thumb/100/100'} 
                                  alt="" 
                                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                                  referrerPolicy="no-referrer" 
                                />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{session.screens[0]?.name || 'Untitled'}</p>
                                <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mt-1">{new Date(session.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-8">
                              <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest">
                                 {critical > 0 && <span className="text-red-400/80">{critical} Critical</span>}
                                 {attention > 0 && <span className="text-amber-400/80">{attention} Attention</span>}
                                 {critical === 0 && attention === 0 && <span className="text-emerald-400/80">Healthy</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => confirmDelete(e, session.id)}
                                  className="p-2 text-slate-800 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Delete Review"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <ChevronRight className="w-4 h-4 text-slate-800 group-hover:text-blue-500 transition-colors" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {sessions.filter(s => s.state === 'completed').length === 0 && (
                        <div className="p-16 text-center text-slate-700 text-[10px] font-black uppercase tracking-widest italic">
                          No completed reviews yet
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {view === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <HistoryView 
                  sessions={sessions}
                  onSelect={handleSelectHistory}
                  onDelete={deleteSession}
                  onNew={handleNewSession}
                />
              </motion.div>
            )}

            {view === 'editor' && currentSession && (
              <motion.div 
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-screen overflow-hidden flex flex-col"
              >
                {currentSession.state === 'draft' && (
                  <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <SetupFlow 
                      screens={currentSession.screens}
                      options={currentSession.options}
                      onUpdateScreens={(screens) => updateSession({ screens })}
                      onUpdateOptions={(options) => updateSession({ options })}
                      onStart={startAnalysis}
                      error={error}
                      onError={setError}
                    />
                  </div>
                )}

                {currentSession.state === 'running' && (
                  <div className="flex-1 flex items-center justify-center">
                    <ProgressScreen />
                  </div>
                )}

                {currentSession.state === 'completed' && (
                  <div className="flex-1">
                    <ResultsDashboard 
                      session={currentSession}
                      onUpdateIssue={updateIssueStatus}
                      onBack={() => updateSession({ state: 'draft' })}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </ErrorBoundary>
      </main>

      {/* Global Loading Overlay */}
      {loading && currentSession?.state !== 'running' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-white/5 border-t-blue-500 animate-spin shadow-[0_0_20px_rgba(59,130,246,0.3)]"></div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {sessionToDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSessionToDelete(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#151922] border border-white/10 rounded-[2rem] p-10 shadow-2xl space-y-8"
            >
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white tracking-tight">Delete review?</h3>
                <p className="text-slate-500 text-sm font-medium">This action cannot be undone.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setSessionToDelete(null)}
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/10 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeDelete}
                  className="flex-1 px-6 py-4 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 shadow-2xl shadow-red-600/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 bg-blue-600 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-600/40 flex items-center gap-3"
          >
            <ShieldCheck className="w-4 h-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
