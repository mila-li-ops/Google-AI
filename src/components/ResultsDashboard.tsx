import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronRight, 
  ExternalLink, 
  RefreshCcw,
  ArrowLeft,
  LayoutGrid,
  History,
  Eye,
  EyeOff
} from 'lucide-react';
import { AnalysisSession, Issue, IssueStatus } from '../domain/types';
import { motion, AnimatePresence } from 'motion/react';
import { AnnotatedPreview } from './AnnotatedPreview';

interface ResultsDashboardProps {
  session: AnalysisSession;
  onUpdateIssue: (id: string, status: IssueStatus) => void;
  onBack: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  session,
  onUpdateIssue,
  onBack
}) => {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(
    session.issues.length > 0 ? session.issues[0].id : null
  );
  const [showAnnotations, setShowAnnotations] = useState(true);

  const selectedIssue = session.issues.find(i => i.id === selectedIssueId);
  
  // Find the screen associated with the issue, or default to the first screen
  const currentScreen = session.screens.find(s => s.id === selectedIssue?.screenId) || session.screens[0];

  const severityColors = {
    critical: 'text-red-400',
    attention: 'text-amber-400',
    info: 'text-blue-400'
  };

  const statusColors = {
    open: 'text-slate-500',
    planned: 'text-blue-400',
    fixed: 'text-emerald-400',
    dismissed: 'text-slate-600 line-through'
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0f14]">
      {/* Header */}
      <header className="p-6 border-b border-white/5 bg-[#151922] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Analysis Results</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              {new Date(session.createdAt).toLocaleDateString()} • {session.screens.length} screens
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              showAnnotations ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {showAnnotations ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showAnnotations ? 'Annotations ON' : 'Annotations OFF'}
          </button>
          <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
            session.overallHealth === 'critical' ? 'border-red-500/30 text-red-400' :
            session.overallHealth === 'attention' ? 'border-amber-500/30 text-amber-400' :
            'border-blue-500/30 text-blue-400'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              session.overallHealth === 'critical' ? 'bg-red-500' :
              session.overallHealth === 'attention' ? 'bg-amber-500' :
              'bg-blue-500'
            }`}></div>
            Health: {session.overallHealth}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Issue List */}
        <aside className="w-1/3 border-r border-white/5 bg-[#0c0f14] overflow-y-auto scrollbar-hide">
          <div className="p-6 space-y-4">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-2">Identified Issues</h3>
            <div className="space-y-2">
              {session.issues.map((issue) => {
                const isActive = selectedIssueId === issue.id;
                
                return (
                  <button
                    key={issue.id}
                    onClick={() => setSelectedIssueId(issue.id)}
                    className={`w-full text-left p-5 rounded-xl border transition-all relative group ${
                      isActive 
                        ? 'bg-[#151922] border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                        : 'bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${severityColors[issue.severity]}`}>
                            {issue.severity}
                          </span>
                          <span className="text-slate-700">•</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${statusColors[issue.status]}`}>
                            {issue.status}
                          </span>
                        </div>
                        <h4 className={`font-bold text-sm transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                          {issue.title}
                        </h4>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-all ${isActive ? 'text-blue-500 translate-x-1' : 'text-slate-700 group-hover:text-slate-500'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content: Issue Details & Visual Reference */}
        <main className="flex-1 bg-[#0c0f14] overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {selectedIssue ? (
              <motion.div 
                key={selectedIssue.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex h-full"
              >
                {/* Left: Details */}
                <div className="w-1/2 p-10 overflow-y-auto border-r border-white/5 space-y-10 scrollbar-hide">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${severityColors[selectedIssue.severity]}`}>
                        {selectedIssue.severity} Priority
                      </span>
                      <span className="text-white/10">/</span>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                        <LayoutGrid className="w-3 h-3" />
                        {currentScreen?.name || 'Screen'}
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">{selectedIssue.title}</h2>
                  </div>

                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Evidence</h3>
                    <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                      <p className="text-slate-400 leading-relaxed text-sm italic font-medium">"{selectedIssue.evidence}"</p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Analysis</h3>
                    <div className="space-y-6">
                      <p className="text-slate-300 leading-relaxed text-sm font-medium">{selectedIssue.description}</p>
                      <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">User Impact</h4>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">{selectedIssue.impact}</p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Recommendation</h3>
                    <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-4">
                      <p className="text-blue-400 font-bold text-sm leading-relaxed">{selectedIssue.recommendation}</p>
                      {selectedIssue.edgeCases && (
                        <div className="pt-4 border-t border-blue-500/10">
                          <h4 className="text-[9px] font-black text-blue-500/50 uppercase tracking-widest mb-2">Edge Cases</h4>
                          <p className="text-xs text-blue-400/60 italic font-medium leading-relaxed">{selectedIssue.edgeCases}</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <div className="pt-10 border-t border-white/5 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Update Status</h3>
                      <div className="flex gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
                        {(['open', 'planned', 'fixed', 'dismissed'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => onUpdateIssue(selectedIssue.id, status)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                              selectedIssue.status === status 
                                ? 'bg-white/10 text-white shadow-lg' 
                                : 'text-slate-600 hover:text-slate-400'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button className="flex items-center justify-center gap-2 px-6 py-3 text-blue-400 font-bold text-[10px] uppercase tracking-widest hover:bg-blue-500/5 rounded-xl transition-all border border-blue-500/20">
                      <RefreshCcw className="w-3.5 h-3.5" />
                      Re-check issue
                    </button>
                  </div>
                </div>

                {/* Right: Visual Reference */}
                <div className="w-1/2 p-6 flex flex-col bg-black/20">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Visual Canvas</h3>
                    {selectedIssue.anchors && selectedIssue.anchors.length > 0 ? (
                      <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                        {selectedIssue.anchors.length} Annotations
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/5">
                        No Annotations
                      </span>
                    )}
                  </div>
                  
                  {currentScreen ? (
                    <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/5 bg-[#0c0f14]">
                      <AnnotatedPreview 
                        imageUrl={currentScreen.previewUrl}
                        anchors={selectedIssue.anchors || []}
                        showAnnotations={showAnnotations}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center bg-black/40 border border-dashed border-white/5 rounded-2xl text-slate-600 text-[10px] font-black uppercase tracking-widest">
                      No visual reference
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-6">
                <div className="p-8 bg-white/[0.02] rounded-full border border-white/5">
                  <CheckCircle2 className="w-16 h-16 text-slate-800" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Select an issue to begin review</p>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
