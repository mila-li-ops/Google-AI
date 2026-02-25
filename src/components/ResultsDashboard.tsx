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
    critical: 'text-red-600 bg-red-50 border-red-100',
    attention: 'text-amber-600 bg-amber-50 border-amber-100',
    info: 'text-blue-600 bg-blue-50 border-blue-100'
  };

  const severityIcons = {
    critical: AlertTriangle,
    attention: AlertTriangle,
    info: Info
  };

  const statusColors = {
    open: 'bg-slate-100 text-slate-600',
    planned: 'bg-indigo-100 text-indigo-700',
    fixed: 'bg-emerald-100 text-emerald-700',
    dismissed: 'bg-slate-200 text-slate-400 line-through'
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="p-6 border-bottom border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Analysis Results</h1>
            <p className="text-xs text-slate-500">
              {new Date(session.createdAt).toLocaleDateString()} • {session.screens.length} screens
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              showAnnotations ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {showAnnotations ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showAnnotations ? 'Annotations ON' : 'Annotations OFF'}
          </button>
          <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${
            session.overallHealth === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
            session.overallHealth === 'attention' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              session.overallHealth === 'critical' ? 'bg-red-500' :
              session.overallHealth === 'attention' ? 'bg-amber-500' :
              'bg-emerald-500'
            }`}></div>
            Health: {session.overallHealth}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Issue List */}
        <aside className="w-1/3 border-r border-slate-200 bg-slate-50/50 overflow-y-auto">
          <div className="p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Identified Issues</h3>
            {session.issues.map((issue) => {
              const Icon = severityIcons[issue.severity];
              const isActive = selectedIssueId === issue.id;
              
              return (
                <button
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-100' 
                      : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`p-2 rounded-lg ${severityColors[issue.severity]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate">{issue.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${statusColors[issue.status]}`}>
                          {issue.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {issue.confidence} confidence
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${isActive ? 'translate-x-1' : ''}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content: Issue Details & Visual Reference */}
        <main className="flex-1 bg-white overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {selectedIssue ? (
              <motion.div 
                key={selectedIssue.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full"
              >
                {/* Left: Details */}
                <div className="w-1/2 p-8 overflow-y-auto border-r border-slate-100 space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${severityColors[selectedIssue.severity]}`}>
                        {selectedIssue.severity} Severity
                      </span>
                      <span className="text-slate-300">|</span>
                      <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                        <LayoutGrid className="w-3 h-3" />
                        Affects: {currentScreen?.name || 'Screen'}
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedIssue.title}</h2>
                  </div>

                  <section className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Visible Evidence</h3>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-slate-700 leading-relaxed text-sm italic">"{selectedIssue.evidence}"</p>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">The Problem</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">{selectedIssue.description}</p>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Impact</h4>
                      <p className="text-sm text-slate-700">{selectedIssue.impact}</p>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recommendation</h3>
                    <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-xl space-y-3">
                      <p className="text-indigo-900 font-medium text-sm">{selectedIssue.recommendation}</p>
                      {selectedIssue.edgeCases && (
                        <div className="pt-3 border-t border-indigo-100">
                          <h4 className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Edge Cases</h4>
                          <p className="text-xs text-indigo-700 italic">{selectedIssue.edgeCases}</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <div className="pt-8 border-t border-slate-100 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">Update Status</h3>
                      <div className="flex gap-1">
                        {(['open', 'planned', 'fixed', 'dismissed'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => onUpdateIssue(selectedIssue.id, status)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                              selectedIssue.status === status 
                                ? 'bg-slate-900 text-white shadow-md' 
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button className="flex items-center justify-center gap-2 px-4 py-2 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100">
                      <RefreshCcw className="w-4 h-4" />
                      Re-check this issue
                    </button>
                  </div>
                </div>

                {/* Right: Visual Reference */}
                <div className="w-1/2 p-4 bg-slate-50 flex flex-col">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visual Reference</h3>
                    {selectedIssue.anchors && selectedIssue.anchors.length > 0 ? (
                      <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                        {selectedIssue.anchors.length} Annotations
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded">
                        No Annotations
                      </span>
                    )}
                  </div>
                  
                  {currentScreen ? (
                    <div className="flex-1 min-h-0">
                      <AnnotatedPreview 
                        imageUrl={currentScreen.previewUrl}
                        anchors={selectedIssue.anchors || []}
                        showAnnotations={showAnnotations}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center bg-slate-100 border border-dashed border-slate-300 rounded-2xl text-slate-400 text-sm">
                      No visual reference available
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <div className="p-6 bg-slate-50 rounded-full">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <p className="font-medium">Select an issue to view details</p>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
