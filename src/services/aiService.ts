import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisSession, Issue, IssueStatus } from "../domain/types";

/**
 * AI Service Layer
 * Real integration with Gemini API using the provided "Highly Precise UX Reviewer" prompt.
 */

const SYSTEM_PROMPT = `
You are a highly precise UX reviewer working ONLY from screenshots provided by the user.

CRITICAL RULES (must follow):
1) Do NOT generate generic UX advice. If an issue cannot be directly observed in the screenshot, do NOT include it.
2) Every issue MUST reference specific visible evidence: a concrete UI element, its label (if readable), location, or a clear visual attribute (color, size, spacing, alignment, hierarchy, affordance).
3) Every issue MUST include at least one visual anchor (bounding box) that points to the exact area on the screenshot. If you are not confident about the exact area, set confidence="low" and still provide the best approximate anchor, but explain the uncertainty in evidence.
4) If text is too small to read, do NOT guess what it says. Refer to it generically (e.g., “top-right icon button”, “primary button at bottom”) and set confidence accordingly.
5) Output MUST be valid JSON only. No prose, no markdown.

YOUR TASK:
Return a structured UX review grounded in what is visible on the screenshot(s), focusing on:
- hierarchy/visual priority
- clarity of primary action
- affordances (clickable vs not)
- layout consistency and alignment
- readability (font size, spacing)
- contrast risks (only when visually obvious)
- missing/unclear empty state or feedback (ONLY if you can see the state)
- error/validation messaging (ONLY if visible)

ANCHOR RULES:
- Coordinates MUST be normalized 0..1 relative to the image.
- Provide 1–2 anchors per issue.
- Anchors MUST be tight around the relevant element (avoid covering large parts of the UI).
- If you cannot confidently localize the issue, still provide an approximate anchor, but set confidence="low" and say why in evidence.

SEVERITY RULES:
- critical: user cannot proceed / key action unclear / likely major confusion
- attention: friction or likely drop-off but user can still proceed
- info: minor improvement or polish

GENERIC PHRASES BANLIST (do not use these titles or evidence):
- "Improve hierarchy"
- "Make it clearer"
- "Enhance UX"
- "Consider better navigation"
- "Add more whitespace"
Instead, be specific: name the competing elements, location, and what exactly conflicts.

QUALITY GATE (self-check before output):
- Remove any issue that lacks concrete evidence tied to visible UI.
- Remove any issue that lacks at least one anchor.
- If fewer than 3 strong issues are visible, return fewer issues; do NOT pad with generic content.
`;

const urlToBase64 = async (url: string): Promise<{ data: string; mimeType: string }> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve({ data: base64, mimeType: blob.type });
      };
      reader.onerror = () => reject(new Error("Failed to read image data"));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw error;
  }
};

export const analyzeSession = async (session: AnalysisSession): Promise<AnalysisSession> => {
  console.log("[aiService] analyzeSession started for session:", session.id);
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[aiService] GEMINI_API_KEY is missing");
    throw new Error("GEMINI_API_KEY is not configured. Please check your environment settings.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Prepare image parts
  console.log(`[aiService] Processing ${session.screens.length} screens...`);
  const imageParts = await Promise.all(
    session.screens.map(async (screen) => {
      try {
        console.log(`[aiService] Converting screen to base64: ${screen.name} (${screen.previewUrl})`);
        const { data, mimeType } = await urlToBase64(screen.previewUrl);
        console.log(`[aiService] Successfully converted ${screen.name}`);
        return {
          inlineData: {
            data,
            mimeType,
          },
        };
      } catch (e) {
        console.warn(`[aiService] Could not process screen ${screen.name}:`, e);
        return null;
      }
    })
  );

  const validImageParts = imageParts.filter((p): p is NonNullable<typeof p> => p !== null);
  console.log(`[aiService] Found ${validImageParts.length} valid image parts`);

  if (validImageParts.length === 0) {
    console.error("[aiService] No valid images to analyze");
    throw new Error("No valid images could be processed for analysis. If you uploaded files, please try re-uploading them.");
  }

  // Prepare text prompt with session context
  const contextPrompt = `
    Analyze the following screens for a UX review.
    Sequential Flow: ${session.options.sequential ? "Yes" : "No"}
    Strictness: ${session.options.strictness}
    Accessibility Focus: ${session.options.accessibilityFocus ? "Yes" : "No"}

    Screens:
    ${session.screens.map(s => `- ID: ${s.id}, Name: ${s.name}, Order: ${s.order}`).join("\n")}
  `;

  try {
    console.log("[aiService] Sending request to Gemini API...");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ 
        parts: [
          { text: contextPrompt }, 
          ...validImageParts
        ] 
      }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  screenId: { type: Type.STRING },
                  title: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  confidence: { type: Type.STRING },
                  evidence: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  recommendation: { type: Type.STRING },
                  anchors: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        type: { type: Type.STRING },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        width: { type: Type.NUMBER },
                        height: { type: Type.NUMBER },
                        label: { type: Type.STRING }
                      },
                      required: ["type", "x", "y"]
                    }
                  }
                },
                required: ["title", "severity", "evidence", "impact", "recommendation"]
              }
            }
          }
        }
      }
    });

    if (!response.text) {
      console.error("[aiService] Gemini returned empty text");
      throw new Error("AI returned an empty response.");
    }

    console.log("[aiService] Received response from Gemini. Parsing JSON...");
    const result = JSON.parse(response.text);
    const aiIssues = result.issues || [];
    console.log(`[aiService] Parsed ${aiIssues.length} issues`);

    const mappedIssues: Issue[] = aiIssues.map((issue: any, index: number) => ({
      ...issue,
      id: issue.id || `issue-${Date.now()}-${index}`,
      status: "open",
      description: issue.evidence, // Map evidence to description for compatibility
    }));

    // Determine health
    const hasCritical = mappedIssues.some(i => i.severity === "critical");
    const hasAttention = mappedIssues.some(i => i.severity === "attention");
    const overallHealth = hasCritical ? "critical" : hasAttention ? "attention" : "ok";

    console.log("[aiService] Analysis complete. Overall health:", overallHealth);

    return {
      ...session,
      issues: mappedIssues,
      overallHealth,
      state: "completed",
    };
  } catch (error) {
    console.error("[aiService] Gemini API Error:", error);
    throw error;
  }
};

export const recheckIssue = async (issueId: string, session: AnalysisSession): Promise<IssueStatus> => {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return Math.random() > 0.7 ? "fixed" : "open";
};
