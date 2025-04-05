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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DoodleCanvas from '../components/DoodleCanvas';
import { Calendar } from 'react-native-calendars';
import {
  initJournalDb,
  saveJournalEntry,
  getJournalEntriesByDate,
  updateJournalEntry,
  deleteJournalEntry,
  JournalEntry
} from '../utils/journalDb';

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({
    date: new Date().toISOString(),
    content: '',
    mood: '',
    tags: [],
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showDoodleCanvas, setShowDoodleCanvas] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    setupAudio();
    setupImagePicker();
    initJournalDb().then(() => {
      loadEntriesByDate(selectedDate);
    });
  }, []);

  useEffect(() => {
    loadEntriesByDate(selectedDate);
  }, [selectedDate]);

  const loadEntriesByDate = async (date: string) => {
    try {
      const loadedEntries = await getJournalEntriesByDate(date);
      setEntries(loadedEntries);
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
        sentiment: currentEntry.sentiment
      };
      
      try {
        await saveJournalEntry(newEntry);
        await loadEntriesByDate(selectedDate);
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

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setShowEditModal(true);
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry) return;

    try {
      await updateJournalEntry(editingEntry);
      await loadEntriesByDate(selectedDate);
      setShowEditModal(false);
      setEditingEntry(null);
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleDeleteEntry = async (entry: JournalEntry) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteJournalEntry(entry.id);
              await loadEntriesByDate(selectedDate);
            } catch (error) {
              console.error('Error deleting entry:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#F4D06F', '#E29578']}
        style={styles.header}
      >
        <Text style={styles.title}>Journal</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowCalendar(true)}
        >
          <Text style={styles.date}>{new Date(selectedDate).toLocaleDateString()}</Text>
          <Ionicons name="calendar" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {showDoodleCanvas ? (
        <DoodleCanvas
          onSave={handleDoodleSave}
          onClose={() => setShowDoodleCanvas(false)}
        />
      ) : (
        <>
          <ScrollView style={styles.content}>
            {entries.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="journal-outline" size={48} color="#6D597A" />
                <Text style={styles.emptyStateText}>No entries for this date</Text>
              </View>
            ) : (
              entries.map(entry => (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTime}>
                      {new Date(entry.date).toLocaleTimeString()}
                    </Text>
                    <View style={styles.entryActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditEntry(entry)}
                      >
                        <Ionicons name="pencil" size={20} color="#6D597A" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteEntry(entry)}
                      >
                        <Ionicons name="trash" size={20} color="#E29578" />
                      </TouchableOpacity>
                    </View>
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
              ))
            )}
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

      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.calendarContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCalendar(false)}
            >
              <Ionicons name="close" size={24} color="#3E3E3E" />
            </TouchableOpacity>
            <Calendar
              onDayPress={(day: { dateString: string }) => {
                setSelectedDate(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: '#E29578' }
              }}
              theme={{
                selectedDayBackgroundColor: '#E29578',
                todayTextColor: '#6D597A',
                dayTextColor: '#3E3E3E',
                textDisabledColor: '#d9e1e8',
                arrowColor: '#E29578',
              }}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Entry</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowEditModal(false);
                  setEditingEntry(null);
                }}
              >
                <Ionicons name="close" size={24} color="#3E3E3E" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.editTextInput}
              multiline
              value={editingEntry?.content || ''}
              onChangeText={(text) => 
                setEditingEntry(prev => prev ? { ...prev, content: text } : null)
              }
            />

            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdateEntry}
            >
              <Text style={styles.updateButtonText}>Update Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#6D597A',
    marginTop: 16,
    fontFamily: 'Poppins',
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F7F5F2',
  },
  editModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    maxHeight: '80%',
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editModalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#3E3E3E',
  },
  editTextInput: {
    backgroundColor: '#F7F5F2',
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Lora',
    fontSize: 16,
    color: '#3E3E3E',
    minHeight: 150,
    marginBottom: 16,
  },
  updateButton: {
    backgroundColor: '#E29578',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
}); 