
import { GoogleGenAI, Type } from "@google/genai";
import { TriageLevel, TriageResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function analyzeSymptoms(
  text: string, 
  transcript?: string, 
  drawingDescription?: string,
  language: string = 'English'
): Promise<TriageResult> {
  const combinedInput = `
    Language: ${language}
    Patient's written symptoms: ${text}
    Patient's voice transcript: ${transcript || 'None'}
    Description of pain location/drawing: ${drawingDescription || 'None'}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: combinedInput,
      config: {
        systemInstruction: `
          You are an expert ER Triage Nurse. Analyze the patient's inputs and assign a Triage Level (1-5) based on the ESI (Emergency Severity Index).
          Level 1: Resuscitation (Immediate, Life-threatening)
          Level 2: Emergent (High risk, confused, lethargic, severe pain)
          Level 3: Urgent (Stable but requires multiple resources)
          Level 4: Less Urgent (Stable, requires one resource)
          Level 5: Non-Urgent (Stable, requires no resources)
          
          CRITICAL: Provide the 'summary' in the patient's requested language (${language}). 
          Keep the technical 'reason' in English for staff.
          Return a JSON object.
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.INTEGER, description: 'Triage level 1 to 5' },
            summary: { type: Type.STRING, description: 'Clinical summary in user language' },
            isEmergency: { type: Type.BOOLEAN, description: 'True if level 1 or 2' },
            reason: { type: Type.STRING, description: 'Reason for this triage level assignment (English)' }
          },
          required: ['level', 'summary', 'isEmergency', 'reason']
        }
      }
    });

    const result = JSON.parse(response.text);
    return {
      level: result.level as TriageLevel,
      summary: result.summary,
      isEmergency: result.isEmergency,
      reason: result.reason
    };
  } catch (error) {
    console.error("AI Triage Analysis failed:", error);
    return {
      level: TriageLevel.LEVEL_3,
      summary: "Manual triage required. Symptoms: " + text.substring(0, 50),
      isEmergency: false,
      reason: "AI analysis failed."
    };
  }
}
