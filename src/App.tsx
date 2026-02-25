import { useAnalysis } from "./hooks/useAnalysis";
import { SetupFlow } from "./components/SetupFlow";
import { ProgressScreen } from "./components/ProgressScreen";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { HistoryView } from "./components/HistoryView";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LayoutGrid, History, PlusCircle, Sparkles, Home, ChevronRight, Activity, Clock, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
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

  // Automatically switch to editor when a session is created or selected
  useEffect(() => {
    if (currentSession) {
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Rail */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center py-8 z-50">
        <div className="mb-12 p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1 flex flex-col gap-6">
          <button 
            onClick={() => setView('dashboard')}
            className={`p-3 rounded-xl transition-all group relative ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <Home className="w-6 h-6" />
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              Dashboard
            </span>
          </button>

          <button 
            onClick={handleNewSession}
            className="p-3 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all group relative"
          >
            <PlusCircle className="w-6 h-6" />
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              New Review
            </span>
          </button>
          
          <div className="h-px w-8 bg-slate-100 mx-auto my-2" />

          <button 
            onClick={() => setView('editor')}
            disabled={!currentSession}
            className={`p-3 rounded-xl transition-all group relative ${view === 'editor' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'} disabled:opacity-20 disabled:cursor-not-allowed`}
          >
            <LayoutGrid className="w-6 h-6" />
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              Active Session
            </span>
          </button>

          <button 
            onClick={() => setView('history')}
            className={`p-3 rounded-xl transition-all group relative ${view === 'history' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <History className="w-6 h-6" />
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              History
            </span>
          </button>
        </div>

        <div className="mt-auto">
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
            <img src="https://picsum.photos/seed/user/100/100" alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pl-20 min-h-screen">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-6xl mx-auto p-12 space-y-12"
              >
                <header className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">UX Pre-Handoff Review</h1>
                    <p className="text-lg text-slate-500">Ready to polish your next user experience?</p>
                  </div>
                  <button 
                    onClick={handleNewSession}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Start New Review
                  </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit">
                      <Activity className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{sessions.length}</h3>
                    <p className="text-slate-500 font-medium">Total Reviews</p>
                  </div>
                  <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      {sessions.filter(s => s.overallHealth === 'ok').length}
                    </h3>
                    <p className="text-slate-500 font-medium">Healthy Flows</p>
                  </div>
                  <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      {sessions.filter(s => s.state === 'draft').length}
                    </h3>
                    <p className="text-slate-500 font-medium">Pending Drafts</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                      <button onClick={() => setView('history')} className="text-sm font-bold text-indigo-600 hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                      {sessions.slice(0, 3).map((session) => (
                        <div 
                          key={session.id}
                          onClick={() => handleSelectHistory(session.id)}
                          className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-indigo-300 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden">
                              <img src={session.screens[0]?.previewUrl || 'https://picsum.photos/seed/empty/100/100'} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{session.screens[0]?.name || 'Untitled'}</p>
                              <p className="text-xs text-slate-400">{new Date(session.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                        </div>
                      ))}
                      {sessions.length === 0 && (
                        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
                          No recent activity
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">UX Insights</h2>
                    <div className="p-8 bg-slate-900 rounded-3xl text-white space-y-6 relative overflow-hidden">
                      <div className="relative z-10 space-y-4">
                        <p className="text-indigo-300 font-bold uppercase tracking-widest text-xs">Pro Tip</p>
                        <h3 className="text-2xl font-bold leading-tight">Consistency is the key to user confidence.</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          Our AI analysis focuses on identifying pattern deviations across your screens. 
                          Ensure your primary actions are always in the same visual location.
                        </p>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
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
                  <div className="flex-1 overflow-y-auto">
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
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
        </div>
      )}
    </div>
  );
}
