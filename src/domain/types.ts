/**
 * Domain Layer: Strict Types and Models
 */

export type AnalysisOptions = {
  sequential: boolean;
  strictness: "light" | "normal" | "strict";
  accessibilityFocus: boolean;
};

export type ScreenInput = {
  id: string;
  name: string;
  type: "upload" | "url";
  previewUrl: string;
  order: number;
};

export type IssueSeverity = "critical" | "attention" | "info";
export type IssueConfidence = "high" | "medium" | "low";
export type IssueStatus = "open" | "planned" | "fixed" | "dismissed";

export type Anchor =
  | {
      type: "rect";
      x: number; // normalized 0..1
      y: number;
      width: number;
      height: number;
      label?: string;
    }
  | {
      type: "point";
      x: number;
      y: number;
      label?: string;
    };

export type Issue = {
  id: string;
  title: string;
  severity: IssueSeverity;
  impact: string;
  confidence: IssueConfidence;
  evidence: string;
  description: string;
  recommendation: string;
  edgeCases?: string;
  status: IssueStatus;
  anchors?: Anchor[];
  screenId?: string;
};

export type SessionState = "draft" | "running" | "completed";

export type AnalysisSession = {
  id: string;
  createdAt: string;
  screens: ScreenInput[];
  options: AnalysisOptions;
  overallHealth: "ok" | "attention" | "critical";
  issues: Issue[];
  state: SessionState;
};
