import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { saveMoodRating, getMoodRatings, savePositiveThought, getPositiveThoughts } from '../utils/storage';
import { PomodoroTimer } from '../components/PomodoroTimer';
import BottomNavBar from '../components/BottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';
import FakeCall from '../components/FakeCall';

interface MoodEntry {
  date: string;
  mood: string;
  timestamp: number;
}

interface PositiveThought {
  id: string;
  content: string;
  date: string;
}

const MOODS = [
  { emoji: '😄', value: 'very_happy' },
  { emoji: '🙂', value: 'happy' },
  { emoji: '😐', value: 'neutral' },
  { emoji: '😕', value: 'sad' },
  { emoji: '😢', value: 'very_sad' },
];

export default function HomeScreen() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showMoodCalendar, setShowMoodCalendar] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [positiveThought, setPositiveThought] = useState('');
  const [showPositivityPot, setShowPositivityPot] = useState(false);
  const [positiveThoughts, setPositiveThoughts] = useState<PositiveThought[]>([]);
  const [showFakeCall, setShowFakeCall] = useState(false);

  useEffect(() => {
    loadMoodHistory();
    loadPositiveThoughts();
  }, []);

  const loadMoodHistory = async () => {
    const history = await getMoodRatings();
    setMoodHistory(history);
  };

  const loadPositiveThoughts = async () => {
    const thoughts = await getPositiveThoughts();
    setPositiveThoughts(thoughts);
  };

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    const entry = {
      date: new Date().toISOString().split('T')[0],
      mood,
      timestamp: Date.now(),
    };
    await saveMoodRating(entry);
    await loadMoodHistory();
  };

  const handleSavePositiveThought = async () => {
    if (!positiveThought.trim()) return;
    
    const thought = {
      id: Date.now().toString(),
      content: positiveThought.trim(),
      date: new Date().toISOString().split('T')[0],
    };
    
    await savePositiveThought(thought);
    setPositiveThought('');
    await loadPositiveThoughts();
  };

  const getMoodCalendarMarkers = () => {
    const markers: any = {};
    moodHistory.forEach((entry) => {
      markers[entry.date] = {
        marked: true,
        dotColor: '#E29578',
        text: MOODS.find(m => m.value === entry.mood)?.emoji,
        textColor: '#000',
        customStyles: {
          container: {
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: 4,
          },
          text: {
            fontSize: 20,
            fontWeight: 'bold',
          },
        },
      };
    });
    return markers;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F7F5F2', '#F4D06F']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          {/* Mood Check-In Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How Are You Feeling?</Text>
            <View style={styles.moodContainer}>
              {MOODS.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  style={[
                    styles.moodButton,
                    selectedMood === mood.value && styles.selectedMood,
                  ]}
                  onPress={() => handleMoodSelect(mood.value)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={() => setShowMoodCalendar(true)}
            >
              <Text style={styles.buttonText}>Analyze Mood</Text>
            </TouchableOpacity>
          </View>

          {/* Positive Thought Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Write Something Positive Today</Text>
            <TextInput
              style={styles.thoughtInput}
              multiline
              placeholder="What made you smile today?"
              placeholderTextColor="#E29578"
              value={positiveThought}
              onChangeText={setPositiveThought}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSavePositiveThought}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.positivityButton}
              onPress={() => setShowPositivityPot(true)}
            >
              <Text style={styles.buttonText}>Your Positivity Pot</Text>
            </TouchableOpacity>
          </View>

          {/* Focus Timer Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Focus Timer</Text>
            <PomodoroTimer />
          </View>

          {/* Mood Calendar Modal */}
          <Modal
            visible={showMoodCalendar}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowMoodCalendar(false)}
                >
                  <Ionicons name="close" size={24} color="#3E3E3E" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Your Mood History</Text>
                <Calendar
                  markedDates={getMoodCalendarMarkers()}
                  markingType="custom"
                  theme={{
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 16,
                    selectedDayBackgroundColor: '#E29578',
                    selectedDayTextColor: '#fff',
                    todayTextColor: '#6D597A',
                    dayTextColor: '#3E3E3E',
                    textDisabledColor: '#d9e1e8',
                    dotColor: '#E29578',
                    monthTextColor: '#3E3E3E',
                  }}
                />
              </View>
            </View>
          </Modal>

          {/* Positivity Pot Modal */}
          <Modal
            visible={showPositivityPot}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowPositivityPot(false)}
                >
                  <Ionicons name="close" size={24} color="#3E3E3E" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Your Positivity Pot</Text>
                <ScrollView style={styles.thoughtsList}>
                  {positiveThoughts.map((thought) => (
                    <View key={thought.id} style={styles.thoughtItem}>
                      <Text style={styles.thoughtDate}>
                        {new Date(thought.date).toLocaleDateString()}
                      </Text>
                      <Text style={styles.thoughtText}>{thought.content}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </LinearGradient>

      {/* Floating fake call button */}
      <TouchableOpacity
        style={styles.fakeCallButton}
        onPress={() => setShowFakeCall(true)}
      >
        <Ionicons name="call" size={24} color="#fff" />
        <Text style={styles.fakeCallText}>Fake Call</Text>
      </TouchableOpacity>

      {/* Fake Call Modal */}
      {showFakeCall && (
        <FakeCall
          onClose={() => setShowFakeCall(false)}
          callerName="Emergency Contact"
          callerNumber="+1 (555) 123-4567"
        />
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
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80,
  },
  section: {
    padding: 16,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#3E3E3E',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  moodButton: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F7F5F2',
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedMood: {
    backgroundColor: '#F4D06F',
    transform: [{ scale: 1.1 }],
  },
  moodEmoji: {
    fontSize: 32,
  },
  thoughtInput: {
    borderWidth: 1,
    borderColor: '#E29578',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Lora',
    color: '#3E3E3E',
    backgroundColor: '#fff',
  },
  analyzeButton: {
    backgroundColor: '#E29578',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: '#E29578',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  positivityButton: {
    backgroundColor: '#6D597A',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(62, 62, 62, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#3E3E3E',
  },
  thoughtsList: {
    maxHeight: '80%',
  },
  thoughtItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4D06F',
    backgroundColor: '#F7F5F2',
    borderRadius: 8,
    marginBottom: 8,
  },
  thoughtDate: {
    fontSize: 14,
    fontFamily: 'Lora',
    color: '#6D597A',
    marginBottom: 4,
  },
  thoughtText: {
    fontSize: 16,
    fontFamily: 'Lora',
    color: '#3E3E3E',
  },
  fakeCallButton: {
    position: 'absolute',
    right: 20,
    bottom: 100, // Position above bottom navigation bar
    backgroundColor: '#E29578',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  fakeCallText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '600',
    marginLeft: 8,
  },
}); 