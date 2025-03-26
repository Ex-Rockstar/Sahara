import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as SecureStore from 'expo-secure-store';
import { format, parseISO, isToday, isSameDay } from 'date-fns';
import { Calendar, DateData } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import {
  initializeStorage,
  saveJournalEntries,
  getJournalEntries,
  saveAudioFile,
  deleteAudioFile,
  getStorageInfo,
  saveImage,
} from '../utils/storage';
import * as ImagePicker from 'expo-image-picker';
import { DrawingCanvas } from './DrawingCanvas';
import { AudioPlayer } from './AudioPlayer';

interface JournalEntry {
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

const MOODS = [
  { id: 'happy', label: 'Happy', color: '#FFD700', icon: 'happy' },
  { id: 'calm', label: 'Calm', color: '#87CEEB', icon: 'leaf' },
  { id: 'anxious', label: 'Anxious', color: '#FF6B6B', icon: 'warning' },
  { id: 'overwhelmed', label: 'Overwhelmed', color: '#9370DB', icon: 'cloudy' },
  { id: 'sad', label: 'Sad', color: '#4682B4', icon: 'rainy' },
];

const PROMPTS = [
  "What made you smile today?",
  "What's one thing you're grateful for?",
  "How are you feeling right now?",
  "What's on your mind?",
  "What would make today better?",
];

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [showPinModal, setShowPinModal] = useState(true);
  const [showDrawing, setShowDrawing] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    initializeStorage();
    loadEntries();
    checkLockStatus();
  }, []);

  const loadEntries = async () => {
    try {
      const savedEntries = await getJournalEntries();
      setEntries(savedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const saveEntries = async (newEntries: JournalEntry[]) => {
    try {
      const success = await saveJournalEntries(newEntries);
      if (success) {
        setEntries(newEntries);
      }
    } catch (error) {
      console.error('Error saving entries:', error);
    }
  };

  const checkLockStatus = async () => {
    try {
      const savedPin = await SecureStore.getItemAsync('journal_pin');
      if (savedPin) {
        setPin(savedPin);
        setShowPinModal(true);
      } else {
        // Set default PIN to 0612 if no PIN exists
        await SecureStore.setItemAsync('journal_pin', '0612');
        setPin('0612');
        setShowPinModal(true);
      }
    } catch (error) {
      console.error('Error checking lock status:', error);
    }
  };

  const handlePinSubmit = async () => {
    try {
      await SecureStore.setItemAsync('journal_pin', pin);
      setIsLocked(false);
      setShowPinModal(false);
    } catch (error) {
      console.error('Error setting PIN:', error);
    }
  };

  const startRecording = async () => {
    try {
      // Request permissions first
      const permissionResponse = await Audio.requestPermissionsAsync();
      if (permissionResponse.status !== 'granted') {
        console.error('Permission to access microphone was denied');
        return;
      }

      // Set audio mode with all necessary options
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create new recording instance
      const newRecording = new Audio.Recording();
      
      // Prepare the recording with high quality preset
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      // Start recording
      setRecording(newRecording);
      await newRecording.startAsync();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) {
        return;
      }

      // Stop recording
      await recording.stopAndUnloadAsync();
      setIsRecording(false);

      // Get recording URI
      const uri = recording.getURI();
      
      if (uri && currentEntry) {
        // Save the audio file to local storage
        const savedPath = await saveAudioFile(uri);
        if (savedPath) {
          setCurrentEntry(prev => ({
            ...prev!,
            voiceNote: savedPath
          }));
        }
      }

      // Clean up
      setRecording(null);

    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setCurrentEntry(entry);
  };

  const saveEntry = async () => {
    if (!currentEntry?.content.trim()) return;

    const newEntry: JournalEntry = {
      id: currentEntry.id || Date.now().toString(),
      date: currentEntry.date || format(new Date(), 'yyyy-MM-dd'),
      content: currentEntry.content,
      mood: currentEntry.mood,
      tags: currentEntry.tags,
      voiceNote: currentEntry.voiceNote,
      images: currentEntry.images,
      drawings: currentEntry.drawings,
      sentiment: currentEntry.sentiment,
    };

    const updatedEntries = entries.filter(e => e.id !== newEntry.id).concat(newEntry);
    await saveEntries(updatedEntries);
    setCurrentEntry(null);
  };

  const getEntryForDate = (date: string) => {
    return entries.find(entry => isSameDay(parseISO(entry.date), parseISO(date)));
  };

  const getMoodColor = (mood: string) => {
    const moodObj = MOODS.find(m => m.id === mood);
    return moodObj?.color || '#CCCCCC';
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      const savedUri = await saveImage(result.assets[0].uri);
      if (savedUri && currentEntry) {
        setCurrentEntry({
          ...currentEntry,
          images: [...(currentEntry.images || []), savedUri],
        });
      }
    }
  };

  const handleDrawingSave = async (uri: string) => {
    if (currentEntry) {
      setCurrentEntry({
        ...currentEntry,
        drawings: [...(currentEntry.drawings || []), uri],
      });
    }
    setShowDrawing(false);
  };

  const deleteRecording = async (uri: string) => {
    if (currentEntry) {
      await deleteAudioFile(uri);
      setCurrentEntry({
        ...currentEntry,
        voiceNote: undefined,
      });
    }
  };

  const renderEntry = (entry: JournalEntry) => (
    <TouchableOpacity 
      key={entry.id} 
      style={styles.entryContainer}
      onPress={() => handleEditEntry(entry)}
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>
          {format(parseISO(entry.date), 'MMMM d, yyyy')}
        </Text>
        <View style={[styles.moodTag, { backgroundColor: getMoodColor(entry.mood) }]}>
          <Ionicons name={MOODS.find(m => m.id === entry.mood)?.icon as any} size={16} color="#FFF" />
          <Text style={styles.moodText}>{entry.mood}</Text>
        </View>
      </View>

      <Text style={styles.entryContent}>{entry.content}</Text>

      {entry.voiceNote && (
        <AudioPlayer
          uri={entry.voiceNote}
          onDelete={() => deleteRecording(entry.voiceNote!)}
        />
      )}

      {entry.images && entry.images.length > 0 && (
        <ScrollView horizontal style={styles.imageContainer}>
          {entry.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.image}
            />
          ))}
        </ScrollView>
      )}

      {entry.drawings && entry.drawings.length > 0 && (
        <ScrollView horizontal style={styles.imageContainer}>
          {entry.drawings.map((drawing, index) => (
            <Image
              key={index}
              source={{ uri: drawing }}
              style={styles.drawing}
            />
          ))}
        </ScrollView>
      )}

      {entry.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {entry.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEntryEditor = () => (
    <View style={styles.newEntryContainer}>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Write your thoughts..."
        value={currentEntry?.content}
        onChangeText={(text) => setCurrentEntry({ ...currentEntry!, content: text })}
      />

      <View style={styles.mediaButtons}>
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Ionicons
            name={isRecording ? 'stop-circle' : 'mic'}
            size={24}
            color={isRecording ? '#FF6B6B' : '#333'}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
          <Ionicons name="image" size={24} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mediaButton}
          onPress={() => setShowDrawing(true)}
        >
          <Ionicons name="brush" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.moodSelector}>
        {MOODS.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={[
              styles.moodButton,
              currentEntry?.mood === mood.id && styles.moodButtonActive,
            ]}
            onPress={() => setCurrentEntry({ ...currentEntry!, mood: mood.id })}
          >
            <Ionicons
              name={mood.icon as any}
              size={24}
              color={currentEntry?.mood === mood.id ? '#FFF' : '#333'}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
        <Text style={styles.saveButtonText}>Save Entry</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLocked) {
    return (
      <Modal visible={showPinModal} animationType="slide">
        <View style={styles.pinContainer}>
          <Text style={styles.pinTitle}>Enter PIN to Unlock Journal</Text>
          <TextInput
            style={styles.pinInput}
            secureTextEntry
            value={pin}
            onChangeText={setPin}
            placeholder="Enter PIN"
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.pinButton} onPress={handlePinSubmit}>
            <Text style={styles.pinButtonText}>Unlock</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Journal</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => setShowCalendar(!showCalendar)}>
              <Ionicons name="calendar" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsLocked(true)}>
              <Ionicons name="lock-closed" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {showCalendar ? (
          <Calendar
            onDayPress={(day: DateData) => {
              setSelectedDate(day.dateString);
              setShowCalendar(false);
            }}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#FF6B6B' },
            }}
          />
        ) : (
          <ScrollView style={styles.content}>
            {currentEntry ? renderEntryEditor() : (
              <TouchableOpacity
                style={styles.newEntryButton}
                onPress={() => setCurrentEntry({
                  id: Date.now().toString(),
                  date: format(new Date(), 'yyyy-MM-dd'),
                  content: '',
                  mood: '',
                  tags: [],
                })}
              >
                <Ionicons name="add-circle" size={24} color="#FF6B6B" />
                <Text style={styles.newEntryText}>New Entry</Text>
              </TouchableOpacity>
            )}

            {entries
              .filter(entry => isSameDay(parseISO(entry.date), parseISO(selectedDate)))
              .map(renderEntry)}
          </ScrollView>
        )}

        <Modal visible={showDrawing} animationType="slide">
          <DrawingCanvas
            onSave={handleDrawingSave}
            onClose={() => setShowDrawing(false)}
          />
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  newEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
  },
  newEntryText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  newEntryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    minHeight: 150,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlignVertical: 'top',
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  moodButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  moodButtonActive: {
    backgroundColor: '#FFE5E5',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  recordingButton: {
    backgroundColor: '#FFE5E5',
  },
  entryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 14,
    color: '#666',
  },
  moodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodText: {
    marginLeft: 4,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  entryContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  pinContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  pinTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  pinInput: {
    width: '100%',
    maxWidth: 200,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  pinButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  pinButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mediaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  mediaButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
  },
  imageContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  drawing: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f8f9fa',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Journal; 