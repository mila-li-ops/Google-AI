import { AnalysisSession } from "../domain/types";

/**
 * Session Repository
 * Abstraction for persistence (localStorage for now)
 */

const STORAGE_KEY = "ux_review_sessions";

export const SessionRepository = {
  getAll: (): AnalysisSession[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse sessions", e);
      return [];
    }
  },

  getById: (id: string): AnalysisSession | undefined => {
    return SessionRepository.getAll().find((s) => s.id === id);
  },

  save: (session: AnalysisSession): void => {
    const sessions = SessionRepository.getAll();
    const index = sessions.findIndex((s) => s.id === session.id);
    
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  },

  delete: (id: string): void => {
    const sessions = SessionRepository.getAll().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }
};
