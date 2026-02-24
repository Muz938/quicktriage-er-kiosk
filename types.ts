
export enum TriageLevel {
  LEVEL_1 = 1, // Resuscitation (Red)
  LEVEL_2 = 2, // Emergent (Orange)
  LEVEL_3 = 3, // Urgent (Yellow)
  LEVEL_4 = 4, // Less Urgent (Green)
  LEVEL_5 = 5  // Non-Urgent (Blue)
}

export interface Patient {
  id: string;
  queueNumber: string;
  name: string;
  checkInTime: Date;
  symptoms: string;
  voiceTranscript?: string;
  drawingData?: string; // Base64 canvas data
  photoData?: string; // Base64 photo data
  triageLevel: TriageLevel;
  status: 'waiting' | 'called' | 'treating' | 'completed';
  aiSummary?: string;
  urgencyFlag: boolean;
}

export interface TriageResult {
  level: TriageLevel;
  summary: string;
  isEmergency: boolean;
  reason: string;
}
