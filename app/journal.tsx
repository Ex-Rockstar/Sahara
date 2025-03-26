import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DoodleCanvas from '../components/DoodleCanvas';
import {
  initializeStorage,
  saveJournalEntries,
  getJournalEntries,
} from '../utils/storage';

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

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({
    date: new Date().toISOString().split('T')[0],
    content: '',
    mood: '',
    tags: [],
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showDoodleCanvas, setShowDoodleCanvas] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setupAudio();
    setupImagePicker();
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const savedEntries = await getJournalEntries();
      setEntries(savedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const setupAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const setupImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }
  };

  const startRecording = async () => {
    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        setCurrentEntry(prev => ({
          ...prev!,
          voiceNote: uri,
        }));
      }
      setRecording(null);
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setCurrentEntry(prev => ({
          ...prev!,
          images: [...(prev?.images || []), result.assets[0].uri],
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleDoodleSave = (uri: string) => {
    setCurrentEntry(prev => ({
      ...prev!,
      drawings: [...(prev?.drawings || []), uri],
    }));
    setShowDoodleCanvas(false);
  };

  const saveEntry = async () => {
    if (currentEntry.content?.trim() || currentEntry.images?.length || 
        currentEntry.voiceNote || currentEntry.drawings?.length) {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        content: currentEntry.content || '',
        mood: currentEntry.mood || '',
        tags: currentEntry.tags || [],
        voiceNote: currentEntry.voiceNote,
        images: currentEntry.images,
        drawings: currentEntry.drawings,
      };
      
      const updatedEntries = [newEntry, ...entries];
      try {
        await saveJournalEntries(updatedEntries);
        setEntries(updatedEntries);
        setCurrentEntry({
          date: new Date().toISOString(),
          content: '',
          mood: '',
          tags: [],
        });
      } catch (error) {
        console.error('Error saving entry:', error);
      }
    }
  };

  const filteredEntries = entries.filter(entry => 
    entry.date.split('T')[0] === selectedDate
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#F4D06F', '#E29578']}
        style={styles.header}
      >
        <Text style={styles.title}>Journal</Text>
        <Text style={styles.date}>{new Date(selectedDate).toLocaleDateString()}</Text>
      </LinearGradient>

      {showDoodleCanvas ? (
        <DoodleCanvas
          onSave={handleDoodleSave}
          onClose={() => setShowDoodleCanvas(false)}
        />
      ) : (
        <>
          <ScrollView style={styles.content}>
            {filteredEntries.map(entry => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTime}>
                    {new Date(entry.date).toLocaleTimeString()}
                  </Text>
                </View>
                
                {entry.content && (
                  <Text style={styles.entryText}>{entry.content}</Text>
                )}
                
                {entry.voiceNote && (
                  <TouchableOpacity style={styles.voiceButton}>
                    <Ionicons name="play-circle" size={24} color="#6D597A" />
                    <Text style={styles.voiceText}>Play Recording</Text>
                  </TouchableOpacity>
                )}
                
                {entry.images && entry.images.map((uri: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={styles.entryImage}
                    resizeMode="cover"
                  />
                ))}

                {entry.drawings && entry.drawings.map((uri: string, index: number) => (
                  <View key={index} style={styles.doodleContainer}>
                    <Text style={styles.doodleText}>Doodle Entry</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Write your thoughts..."
              value={currentEntry.content || ''}
              onChangeText={(text) => setCurrentEntry(prev => ({ ...prev!, content: text }))}
            />

            <View style={styles.toolsContainer}>
              <TouchableOpacity
                style={[styles.toolButton, isRecording && styles.toolButtonActive]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Ionicons
                  name={isRecording ? "stop-circle" : "mic"}
                  size={24}
                  color={isRecording ? "#E29578" : "#6D597A"}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolButton} onPress={pickImage}>
                <Ionicons name="image" size={24} color="#6D597A" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolButton}
                onPress={() => setShowDoodleCanvas(true)}
              >
                <Ionicons name="brush" size={24} color="#6D597A" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
                <Text style={styles.saveButtonText}>Save Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  date: {
    fontSize: 18,
    fontFamily: 'Poppins',
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  entryTime: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#6D597A',
  },
  entryText: {
    fontFamily: 'Lora',
    fontSize: 16,
    color: '#3E3E3E',
    lineHeight: 24,
    marginBottom: 16,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F5F2',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  voiceText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#6D597A',
  },
  entryImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E29578',
  },
  textInput: {
    backgroundColor: '#F7F5F2',
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Lora',
    fontSize: 16,
    color: '#3E3E3E',
    minHeight: 100,
    marginBottom: 16,
  },
  toolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toolButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolButtonActive: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E29578',
  },
  saveButton: {
    backgroundColor: '#E29578',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  doodleContainer: {
    backgroundColor: '#F7F5F2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doodleText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#6D597A',
  },
}); 