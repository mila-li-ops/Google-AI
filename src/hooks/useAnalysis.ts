"use client";

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
    console.log("[useAnalysis] Loading initial sessions from repository");
    setSessions(SessionRepository.getAll());
  }, []);

  const createNewSession = useCallback(() => {
    console.log("[useAnalysis] Creating new session");
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
      
      // If we are in completed state and screens/options change, we should ideally revert to draft
      if (prev.state === "completed" && (updates.screens || updates.options)) {
        console.log("[useAnalysis] Reverting session to draft due to changes");
        updated.state = "draft";
      }
      
      // Persist changes to localStorage if it's an existing session or being promoted
      if (updated.state !== "draft" || sessions.some(s => s.id === updated.id)) {
        SessionRepository.save(updated);
      }
      
      return updated;
    });
  }, [sessions]);

  const startAnalysis = useCallback(async () => {
    console.log("[useAnalysis] startAnalysis called");
    
    if (!currentSession) {
      console.error("[useAnalysis] Validation failed: No current session");
      setError("No active session found. Please start a new review.");
      return;
    }

    if (currentSession.screens.length === 0) {
      console.error("[useAnalysis] Validation failed: No screens added");
      setError("Please add at least one screen to analyze.");
      return;
    }

    console.log("[useAnalysis] Validation passed. Transitioning state: draft -> running");
    
    // Explicitly update state and persist
    const runningSession = { ...currentSession, state: "running" as SessionState };
    setCurrentSession(runningSession);
    SessionRepository.save(runningSession);
    setLoading(true);
    setError(null);

    try {
      console.log("[useAnalysis] Calling analyzeSession service...");
      const result = await runAnalysis(runningSession);
      
      console.log("[useAnalysis] analyzeSession resolved. Transitioning state: running -> completed");
      
      // State Machine: running -> completed
      setCurrentSession(result);
      SessionRepository.save(result);
      setSessions(SessionRepository.getAll());
      console.log("[useAnalysis] Analysis successfully completed and persisted");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Analysis failed. Please try again.";
      console.error("[useAnalysis] analyzeSession rejected:", err);
      setError(errorMessage);
      
      // Revert to draft on error
      const revertedSession = { ...currentSession, state: "draft" as SessionState };
      setCurrentSession(revertedSession);
      SessionRepository.save(revertedSession);
    } finally {
      setLoading(false);
    }
  }, [currentSession, runAnalysis]);

  const selectSession = useCallback((id: string) => {
    console.log("[useAnalysis] Selecting session:", id);
    const session = SessionRepository.getById(id);
    if (session) {
      setCurrentSession(session);
      setError(null);
    } else {
      console.error("[useAnalysis] Session not found:", id);
    }
  }, []);

  const deleteSession = useCallback((id: string) => {
    if (loading && currentSession?.id === id) {
      console.warn("[useAnalysis] Cannot delete session while analysis is running");
      setError("Cannot delete session while analysis is in progress.");
      return false;
    }
    console.log("[useAnalysis] Deleting session:", id);
    SessionRepository.delete(id);
    setSessions(SessionRepository.getAll());
    if (currentSession?.id === id) {
      setCurrentSession(null);
    }
    return true;
  }, [currentSession, loading, setError]);

  const updateIssueStatus = useCallback((issueId: string, status: Issue["status"]) => {
    if (!currentSession) return;
    console.log(`[useAnalysis] Updating issue ${issueId} status to ${status}`);
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
