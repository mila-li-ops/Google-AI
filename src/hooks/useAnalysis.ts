import { useState, useEffect, useCallback } from "react";
import { 
  AnalysisSession, 
  ScreenInput, 
  AnalysisOptions, 
  SessionState,
  Issue
} from "../domain/types";
import { SessionRepository } from "../services/sessionRepository";
import { analyzeSession as runAnalysis } from "../services/aiService";

/**
 * Application Layer: State Orchestration
 */

export const useAnalysis = () => {
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [currentSession, setCurrentSession] = useState<AnalysisSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial history
  useEffect(() => {
    setSessions(SessionRepository.getAll());
  }, []);

  const createNewSession = useCallback(() => {
    const newSession: AnalysisSession = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      screens: [],
      options: {
        sequential: false,
        strictness: "normal",
        accessibilityFocus: true,
      },
      overallHealth: "ok",
      issues: [],
      state: "draft",
    };
    setCurrentSession(newSession);
    setError(null);
  }, []);

  const updateSession = useCallback((updates: Partial<AnalysisSession>) => {
    setCurrentSession(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      // If we are in completed state and screens/options change, we should ideally revert to draft or warn
      // For this MVP, we'll allow editing but mark that it needs a re-run if state was completed
      if (prev.state === "completed" && (updates.screens || updates.options)) {
        updated.state = "draft";
      }
      return updated;
    });
  }, []);

  const startAnalysis = useCallback(async () => {
    if (!currentSession) return;
    if (currentSession.screens.length === 0) {
      setError("Please add at least one screen to analyze.");
      return;
    }

    // State Machine: draft -> running
    updateSession({ state: "running" });
    setLoading(true);
    setError(null);

    try {
      const result = await runAnalysis(currentSession);
      // State Machine: running -> completed
      setCurrentSession(result);
      SessionRepository.save(result);
      setSessions(SessionRepository.getAll());
    } catch (err) {
      setError("Analysis failed. Please try again.");
      updateSession({ state: "draft" });
    } finally {
      setLoading(false);
    }
  }, [currentSession, updateSession]);

  const selectSession = useCallback((id: string) => {
    const session = SessionRepository.getById(id);
    if (session) {
      setCurrentSession(session);
      setError(null);
    }
  }, []);

  const deleteSession = useCallback((id: string) => {
    SessionRepository.delete(id);
    setSessions(SessionRepository.getAll());
    if (currentSession?.id === id) {
      setCurrentSession(null);
    }
  }, [currentSession]);

  const updateIssueStatus = useCallback((issueId: string, status: Issue["status"]) => {
    if (!currentSession) return;
    const updatedIssues = currentSession.issues.map(issue => 
      issue.id === issueId ? { ...issue, status } : issue
    );
    const updated = { ...currentSession, issues: updatedIssues };
    setCurrentSession(updated);
    SessionRepository.save(updated);
    setSessions(SessionRepository.getAll());
  }, [currentSession]);

  return {
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
  };
};
