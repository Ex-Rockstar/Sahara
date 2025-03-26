import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

import type {
  JournalEntry,
  MoodRating,
  MeditationSession,
  GameScore,
  SoundTherapySession
} from './storage.d';

export interface MoodEntry {
  date: string;
  mood: string;
  timestamp: number;
}

export interface PositiveThought {
  id: string;
  content: string;
  date: string;
}

// Constants for storage paths
const JOURNAL_DIRECTORY = `${FileSystem.documentDirectory}journal/`;
const AUDIO_DIRECTORY = `${JOURNAL_DIRECTORY}audio/`;
const IMAGES_DIRECTORY = `${JOURNAL_DIRECTORY}images/`;

// Storage keys for SecureStore
const STORAGE_KEYS = {
  JOURNAL_ENTRIES: 'journal_entries',
  JOURNAL_PIN: 'journal_pin',
  USER_SETTINGS: 'user_settings',
  MOOD_RATINGS: 'mood_ratings',
  MEDITATION_SESSIONS: 'meditation_sessions',
  GAME_SCORES: 'game_scores',
  SOUND_THERAPY_SESSIONS: 'sound_therapy_sessions',
  EMERGENCY_CONTACTS: 'emergency_contacts',
  POSITIVE_THOUGHTS: 'positive_thoughts',
};

// Initialize storage directories
export const initializeStorage = async (): Promise<void> => {
  try {
    const journalDir = `${FileSystem.documentDirectory}journal`;
    const audioDir = `${journalDir}/audio`;
    const imageDir = `${journalDir}/images`;
    const drawingsDir = `${journalDir}/drawings`;

    await FileSystem.makeDirectoryAsync(journalDir, { intermediates: true });
    await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });
    await FileSystem.makeDirectoryAsync(imageDir, { intermediates: true });
    await FileSystem.makeDirectoryAsync(drawingsDir, { intermediates: true });
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Journal Entries
export const saveJournalEntries = async (entries: JournalEntry[]): Promise<boolean> => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error('Error saving journal entries:', error);
    return false;
  }
};

export const getJournalEntries = async (): Promise<JournalEntry[]> => {
  try {
    const entries = await SecureStore.getItemAsync(STORAGE_KEYS.JOURNAL_ENTRIES);
    return entries ? JSON.parse(entries) : [];
  } catch (error) {
    console.error('Error getting journal entries:', error);
    return [];
  }
};

// Mood Ratings
export const saveMoodRating = async (entry: MoodEntry): Promise<void> => {
  try {
    const existingRatings = await getMoodRatings();
    const todayIndex = existingRatings.findIndex(r => r.date === entry.date);
    
    if (todayIndex !== -1) {
      existingRatings[todayIndex] = entry;
    } else {
      existingRatings.push(entry);
    }
    
    await SecureStore.setItemAsync(
      STORAGE_KEYS.MOOD_RATINGS,
      JSON.stringify(existingRatings)
    );
  } catch (error) {
    console.error('Error saving mood rating:', error);
  }
};

export const getMoodRatings = async (): Promise<MoodEntry[]> => {
  try {
    const ratings = await SecureStore.getItemAsync(STORAGE_KEYS.MOOD_RATINGS);
    return ratings ? JSON.parse(ratings) : [];
  } catch (error) {
    console.error('Error getting mood ratings:', error);
    return [];
  }
};

// Positive Thoughts
export const savePositiveThought = async (thought: PositiveThought): Promise<void> => {
  try {
    const existingThoughts = await getPositiveThoughts();
    existingThoughts.push(thought);
    
    await SecureStore.setItemAsync(
      STORAGE_KEYS.POSITIVE_THOUGHTS,
      JSON.stringify(existingThoughts)
    );
  } catch (error) {
    console.error('Error saving positive thought:', error);
  }
};

export const getPositiveThoughts = async (): Promise<PositiveThought[]> => {
  try {
    const thoughts = await SecureStore.getItemAsync(STORAGE_KEYS.POSITIVE_THOUGHTS);
    return thoughts ? JSON.parse(thoughts) : [];
  } catch (error) {
    console.error('Error getting positive thoughts:', error);
    return [];
  }
};

// Meditation History
export const saveMeditationSession = async (session: MeditationSession): Promise<boolean> => {
  try {
    const sessions = await getMeditationHistory();
    const updatedSessions = [...sessions, session];
    await SecureStore.setItemAsync(STORAGE_KEYS.MEDITATION_SESSIONS, JSON.stringify(updatedSessions));
    return true;
  } catch (error) {
    console.error('Error saving meditation session:', error);
    return false;
  }
};

export const getMeditationHistory = async (): Promise<MeditationSession[]> => {
  try {
    const sessions = await SecureStore.getItemAsync(STORAGE_KEYS.MEDITATION_SESSIONS);
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error getting meditation history:', error);
    return [];
  }
};

// Game Scores
export const saveGameScore = async (score: GameScore): Promise<boolean> => {
  try {
    const scores = await getGameScores();
    const updatedScores = [...scores, score];
    await SecureStore.setItemAsync(STORAGE_KEYS.GAME_SCORES, JSON.stringify(updatedScores));
    return true;
  } catch (error) {
    console.error('Error saving game score:', error);
    return false;
  }
};

export const getGameScores = async (): Promise<GameScore[]> => {
  try {
    const scores = await SecureStore.getItemAsync(STORAGE_KEYS.GAME_SCORES);
    return scores ? JSON.parse(scores) : [];
  } catch (error) {
    console.error('Error getting game scores:', error);
    return [];
  }
};

// Sound Therapy History
export const saveSoundTherapySession = async (session: SoundTherapySession): Promise<boolean> => {
  try {
    const sessions = await getSoundTherapyHistory();
    const updatedSessions = [...sessions, session];
    await SecureStore.setItemAsync(STORAGE_KEYS.SOUND_THERAPY_SESSIONS, JSON.stringify(updatedSessions));
    return true;
  } catch (error) {
    console.error('Error saving sound therapy session:', error);
    return false;
  }
};

export const getSoundTherapyHistory = async (): Promise<SoundTherapySession[]> => {
  try {
    const sessions = await SecureStore.getItemAsync(STORAGE_KEYS.SOUND_THERAPY_SESSIONS);
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error getting sound therapy history:', error);
    return [];
  }
};

// Emergency Contacts
export const saveEmergencyContacts = async (contacts: any[]): Promise<boolean> => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(contacts));
    return true;
  } catch (error) {
    console.error('Error saving emergency contacts:', error);
    return false;
  }
};

export const getEmergencyContacts = async (): Promise<any[]> => {
  try {
    const contacts = await SecureStore.getItemAsync(STORAGE_KEYS.EMERGENCY_CONTACTS);
    return contacts ? JSON.parse(contacts) : [];
  } catch (error) {
    console.error('Error getting emergency contacts:', error);
    return [];
  }
};

// Audio Files
export const saveAudioFile = async (uri: string): Promise<string | null> => {
  try {
    const filename = `${Date.now()}.m4a`;
    const destinationUri = `${FileSystem.documentDirectory}journal/audio/${filename}`;
    
    await FileSystem.copyAsync({
      from: uri,
      to: destinationUri,
    });
    
    return destinationUri;
  } catch (error) {
    console.error('Error saving audio file:', error);
    return null;
  }
};

export const deleteAudioFile = async (uri: string): Promise<void> => {
  try {
    await FileSystem.deleteAsync(uri);
  } catch (error) {
    console.error('Error deleting audio file:', error);
  }
};

// Images
export const saveImage = async (uri: string): Promise<string | null> => {
  try {
    const filename = `${Date.now()}.jpg`;
    const destinationUri = `${FileSystem.documentDirectory}journal/images/${filename}`;
    
    await FileSystem.copyAsync({
      from: uri,
      to: destinationUri,
    });
    
    return destinationUri;
  } catch (error) {
    console.error('Error saving image:', error);
    return null;
  }
};

export const deleteImage = async (uri: string): Promise<void> => {
  try {
    await FileSystem.deleteAsync(uri);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

// Clean up storage
export const cleanupStorage = async (): Promise<boolean> => {
  try {
    const dirs = ['journal/audio', 'journal/images', 'journal/drawings'];
    for (const dir of dirs) {
      const dirPath = `${FileSystem.documentDirectory}${dir}`;
      await FileSystem.deleteAsync(dirPath, { idempotent: true });
    }
    return true;
  } catch (error) {
    console.error('Error cleaning up storage:', error);
    return false;
  }
};

// Get storage info
export const getStorageInfo = async (): Promise<FileSystem.FileInfo | null> => {
  try {
    if (!FileSystem.documentDirectory) return null;
    const info = await FileSystem.getInfoAsync(FileSystem.documentDirectory);
    return info;
  } catch (error) {
    console.error('Error getting storage info:', error);
    return null;
  }
}; 