import AsyncStorage from '@react-native-async-storage/async-storage';

const ENTRIES_KEY = 'journal_entries';

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: string;
  moodNote?: string;
  promptResponses?: {
    question: string;
    answer: string;
  }[];
  tags: string[];
  voiceNote?: string;
  images?: string[];
  drawings?: string[];
  sentiment?: string;
}

export const initJournalDb = async () => {
  try {
    const entries = await AsyncStorage.getItem(ENTRIES_KEY);
    if (!entries) {
      await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify([]));
    }
    return true;
  } catch (error) {
    console.error('Error initializing storage:', error);
    return false;
  }
};

export const saveJournalEntry = async (entry: JournalEntry) => {
  try {
    const entriesStr = await AsyncStorage.getItem(ENTRIES_KEY);
    const entries: JournalEntry[] = entriesStr ? JSON.parse(entriesStr) : [];
    
    const existingIndex = entries.findIndex(e => e.id === entry.id);
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.unshift(entry);
    }
    
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error('Error saving entry:', error);
    return false;
  }
};

export const getJournalEntriesByDate = async (date: string): Promise<JournalEntry[]> => {
  try {
    const entriesStr = await AsyncStorage.getItem(ENTRIES_KEY);
    const entries: JournalEntry[] = entriesStr ? JSON.parse(entriesStr) : [];
    
    return entries.filter(entry => entry.date.startsWith(date));
  } catch (error) {
    console.error('Error getting entries:', error);
    return [];
  }
};

export const updateJournalEntry = async (entry: JournalEntry): Promise<boolean> => {
  try {
    const entriesStr = await AsyncStorage.getItem(ENTRIES_KEY);
    const entries: JournalEntry[] = entriesStr ? JSON.parse(entriesStr) : [];
    
    const index = entries.findIndex(e => e.id === entry.id);
    if (index >= 0) {
      entries[index] = entry;
      await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating entry:', error);
    return false;
  }
};

export const deleteJournalEntry = async (id: string): Promise<boolean> => {
  try {
    const entriesStr = await AsyncStorage.getItem(ENTRIES_KEY);
    const entries: JournalEntry[] = entriesStr ? JSON.parse(entriesStr) : [];
    
    const filteredEntries = entries.filter(entry => entry.id !== id);
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(filteredEntries));
    return true;
  } catch (error) {
    console.error('Error deleting entry:', error);
    return false;
  }
};

export const getMoodStatistics = async (startDate: string, endDate: string): Promise<{ date: string; mood: string }[]> => {
  try {
    const entriesStr = await AsyncStorage.getItem(ENTRIES_KEY);
    const entries: JournalEntry[] = entriesStr ? JSON.parse(entriesStr) : [];
    
    return entries
      .filter(entry => entry.date >= startDate && entry.date <= endDate && entry.mood)
      .map(entry => ({
        date: entry.date,
        mood: entry.mood
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error getting mood statistics:', error);
    return [];
  }
}; 