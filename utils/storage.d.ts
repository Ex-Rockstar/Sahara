export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: string;
  tags: string[];
  voiceNote?: string;
  images?: string[];
  drawings?: string[];
  sentiment?: string;
}

export interface MoodRating {
  date: string;
  rating: number;
  notes?: string;
}

export interface MeditationSession {
  date: string;
  duration: number;
  type: string;
  notes?: string;
}

export interface GameScore {
  game: string;
  score: number;
  date: string;
}

export interface SoundTherapySession {
  date: string;
  duration: number;
  sound: string;
  notes?: string;
}

export function initializeStorage(): Promise<void>;
export function saveJournalEntries(entries: JournalEntry[]): Promise<boolean>;
export function getJournalEntries(): Promise<JournalEntry[]>;
export function saveMoodRating(rating: MoodRating): Promise<boolean>;
export function getMoodRatings(): Promise<MoodRating[]>;
export function saveMeditationSession(session: MeditationSession): Promise<boolean>;
export function getMeditationHistory(): Promise<MeditationSession[]>;
export function saveGameScore(score: GameScore): Promise<boolean>;
export function getGameScores(): Promise<GameScore[]>;
export function saveSoundTherapySession(session: SoundTherapySession): Promise<boolean>;
export function getSoundTherapyHistory(): Promise<SoundTherapySession[]>;
export function saveEmergencyContacts(contacts: any[]): Promise<boolean>;
export function getEmergencyContacts(): Promise<any[]>;
export function saveAudioFile(uri: string, entryId: string): Promise<string | null>;
export function deleteAudioFile(filePath: string): Promise<boolean>;
export function saveImage(uri: string, entryId: string): Promise<string | null>;
export function deleteImage(filePath: string): Promise<boolean>;
export function cleanupStorage(): Promise<boolean>;
export function getStorageInfo(): Promise<any>;
