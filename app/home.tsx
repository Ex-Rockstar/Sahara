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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { saveMoodRating, getMoodRatings, savePositiveThought, getPositiveThoughts } from '../utils/storage';
import { PomodoroTimer } from '../components/PomodoroTimer';
import BottomNavBar from '../components/BottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';
import FakeCall from '../components/FakeCall';
import { useRouter } from 'expo-router';
import { saveJournalEntry, getMoodStatistics, JournalEntry } from '../utils/journalDb';

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
  { emoji: '😄', value: 'very_happy', score: 5 },
  { emoji: '🙂', value: 'happy', score: 4 },
  { emoji: '😐', value: 'neutral', score: 3 },
  { emoji: '😕', value: 'sad', score: 2 },
  { emoji: '😢', value: 'very_sad', score: 1 },
];

const MOOD_PROMPTS = {
  very_happy: [
    "What made today especially great?",
    "How can you make tomorrow just as wonderful?",
    "Who would you like to share this happiness with?"
  ],
  happy: [
    "What positive things happened today?",
    "What are you grateful for right now?",
    "How can you spread this happiness to others?"
  ],
  neutral: [
    "What could make your day better?",
    "Is there something specific on your mind?",
    "What's one small positive change you could make?"
  ],
  sad: [
    "What's troubling you today?",
    "Is there someone you could talk to about this?",
    "What usually helps you feel better?"
  ],
  very_sad: [
    "Would you like to talk about what's bothering you?",
    "Have you experienced this feeling before? What helped then?",
    "What's one tiny step you could take to feel better?"
  ]
};

type StyleProps = {
  [key: string]: any;
};

export default function HomeScreen() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showMoodCalendar, setShowMoodCalendar] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [positiveThought, setPositiveThought] = useState('');
  const [showPositivityPot, setShowPositivityPot] = useState(false);
  const [positiveThoughts, setPositiveThoughts] = useState<PositiveThought[]>([]);
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [showMoodPrompts, setShowMoodPrompts] = useState(false);
  const [currentPrompts, setCurrentPrompts] = useState<string[]>([]);
  const [promptResponses, setPromptResponses] = useState<{[key: string]: string}>({});
  const [moodStats, setMoodStats] = useState<{dates: string[], scores: number[]}>({ dates: [], scores: [] });

  useEffect(() => {
    loadMoodHistory();
    loadPositiveThoughts();
    loadMoodStatistics();
  }, []);

  const loadMoodHistory = async () => {
    const history = await getMoodRatings();
    setMoodHistory(history);
  };

  const loadPositiveThoughts = async () => {
    const thoughts = await getPositiveThoughts();
    setPositiveThoughts(thoughts);
  };

  const loadMoodStatistics = async () => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const stats = await getMoodStatistics(startDate, endDate);
    
    const dates = stats.map(s => s.date);
    const scores = stats.map(s => {
      const mood = MOODS.find(m => m.value === s.mood);
      return mood ? mood.score : 3;
    });

    setMoodStats({ dates, scores });
  };

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    const prompts = MOOD_PROMPTS[mood as keyof typeof MOOD_PROMPTS];
    setCurrentPrompts(prompts);
    setPromptResponses({});
    setShowMoodPrompts(true);
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

  const handleSaveMoodEntry = async () => {
    if (!selectedMood) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      content: '',
      mood: selectedMood,
      moodNote: '',
      promptResponses: Object.entries(promptResponses).map(([question, answer]: [string, string]) => ({
        question,
        answer
      })),
      tags: []
    };

    await saveJournalEntry(entry);
    setShowMoodPrompts(false);
    setSelectedMood(null);
    setPromptResponses({});
    await loadMoodStatistics();
  };

  const getMoodCalendarMarkers = () => {
    const markers: any = {};
    moodHistory.forEach((entry: MoodEntry) => {
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

  const renderMoodVisualization = () => {
    if (moodStats.dates.length === 0) return null;

    const lastSevenDays = moodStats.scores.slice(-7);
    const maxHeight = 150;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Your Mood Trend (Last 7 Days)</Text>
        <View style={styles.moodGraph}>
          {lastSevenDays.map((score: number, index: number) => (
            <View key={index} style={styles.moodColumn}>
              <View 
                style={[
                  styles.moodBar, 
                  { 
                    height: (score / 5) * maxHeight,
                    backgroundColor: score >= 4 ? '#83C5BE' : 
                                   score >= 3 ? '#E29578' : 
                                   '#EE6C4D'
                  }
                ]} 
              />
              <Text style={styles.dateLabel}>
                {moodStats.dates[moodStats.dates.length - 7 + index]?.split('-')[2] || ''}
              </Text>
              <Text style={styles.moodEmojiSmall}>
                {MOODS.find(m => m.score === score)?.emoji || ''}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
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

          {/* Mood Prompts Modal */}
          <Modal
            visible={showMoodPrompts}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowMoodPrompts(false)}
                >
                  <Ionicons name="close" size={24} color="#3E3E3E" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Let's Reflect</Text>
                <ScrollView style={styles.promptsContainer}>
                  {currentPrompts.map((prompt: string, index: number) => (
                    <View key={index} style={styles.promptItem}>
                      <Text style={styles.promptQuestion}>{prompt}</Text>
                      <TextInput
                        style={styles.promptInput}
                        multiline
                        placeholder="Type your response..."
                        value={promptResponses[prompt] || ''}
                        onChangeText={(text: string) => {
                          setPromptResponses({
                            ...promptResponses,
                            [prompt]: text
                          });
                        }}
                      />
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveMoodEntry}
                  >
                    <Text style={styles.buttonText}>Save Reflection</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Mood Analysis Modal */}
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
                
                {renderMoodVisualization()}

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
                  {positiveThoughts.map(thought => (
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

      {/* Fake Call Controls */}
      <View style={styles.fakeCallControls}>
        <TouchableOpacity
          style={styles.fakeCallButton}
          onPress={() => setShowFakeCall(true)}
        >
          <Ionicons name="call" size={24} color="#fff" />
          <Text style={styles.fakeCallText}>Fake Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/call-settings')}
        >
          <Ionicons name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {showFakeCall && (
        <FakeCall onClose={() => setShowFakeCall(false)} />
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
  fakeCallControls: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 1000,
  },
  fakeCallButton: {
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
  },
  settingsButton: {
    backgroundColor: '#6D597A',
    padding: 12,
    borderRadius: 30,
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  fakeCallText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '600',
    marginLeft: 8,
  },
  promptsContainer: {
    maxHeight: '80%',
  },
  promptItem: {
    marginBottom: 16,
  },
  promptQuestion: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#3E3E3E',
    marginBottom: 8,
  },
  promptInput: {
    borderWidth: 1,
    borderColor: '#E29578',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    fontSize: 16,
    fontFamily: 'Lora',
    color: '#3E3E3E',
    backgroundColor: '#fff',
  },
  chartContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#3E3E3E',
    marginBottom: 16,
    textAlign: 'center',
  },
  moodGraph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 200,
    paddingHorizontal: 8,
  },
  moodColumn: {
    alignItems: 'center',
    width: 32,
  },
  moodBar: {
    width: 24,
    borderRadius: 12,
    backgroundColor: '#E29578',
  },
  dateLabel: {
    fontSize: 12,
    color: '#3E3E3E',
    marginTop: 4,
  },
  moodEmojiSmall: {
    fontSize: 16,
    marginTop: 2,
  },
}) as StyleProps; 