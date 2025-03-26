import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const BALL_SIZE = width * 0.4;

interface MeditationSession {
  id: string;
  title: string;
  duration: number;
  description: string;
  guidance: string[];
}

const MEDITATION_SESSIONS: MeditationSession[] = [
  {
    id: '1',
    title: 'Quick Calm',
    duration: 5,
    description: 'A brief meditation to help you find calm in moments of stress.',
    guidance: [
      'Find a comfortable position and close your eyes.',
      'Take a deep breath in through your nose...',
      'Hold your breath for a moment...',
      'Slowly exhale through your mouth...',
      'Feel the tension leaving your body...',
    ],
  },
  {
    id: '2',
    title: 'Mindful Break',
    duration: 10,
    description: 'A balanced session to reset your mind and body.',
    guidance: [
      'Sit in a comfortable position with your back straight.',
      'Focus on your natural breathing...',
      'Notice any thoughts that arise...',
      'Let them go without judgment...',
      'Return to your breath...',
    ],
  },
  {
    id: '3',
    title: 'Deep Relaxation',
    duration: 30,
    description: 'An extended session for deep relaxation and stress relief.',
    guidance: [
      'Find a quiet, comfortable space.',
      'Begin with deep, slow breaths...',
      'Scan your body for tension...',
      'Release any tightness you find...',
      'Rest in the present moment...',
    ],
  },
];

const MeditationSection: React.FC = () => {
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentGuidance, setCurrentGuidance] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            playCompletionSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isActive && selectedSession) {
      const guidanceInterval = setInterval(() => {
        setCurrentGuidance((prev) => (prev + 1) % selectedSession.guidance.length);
      }, 10000);

      return () => clearInterval(guidanceInterval);
    }
  }, [isActive, selectedSession]);

  const playCompletionSound = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/meditation-complete.mp3'),
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error playing completion sound:', error);
    }
  };

  const startSession = (session: MeditationSession) => {
    setSelectedSession(session);
    setTimeLeft(session.duration * 60);
    setIsActive(true);
    setCurrentGuidance(0);
  };

  const stopSession = () => {
    setIsActive(false);
    setSelectedSession(null);
    setTimeLeft(0);
    setCurrentGuidance(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const breathingAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    if (isActive) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 4000 }),
          withTiming(1, { duration: 4000 }),
          withTiming(0.8, { duration: 6000 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withSpring(1);
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      {!selectedSession ? (
        <ScrollView style={styles.sessionsList}>
          {MEDITATION_SESSIONS.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionCard}
              onPress={() => startSession(session)}
            >
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <Text style={styles.sessionDuration}>{session.duration} min</Text>
              </View>
              <Text style={styles.sessionDescription}>{session.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.activeSession}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.sessionTitle}>{selectedSession.title}</Text>
          </View>

          <View style={styles.breathingContainer}>
            <Animated.View style={[styles.breathingBall, breathingAnimation]} />
          </View>

          <View style={styles.guidanceContainer}>
            <Text style={styles.guidanceText}>
              {selectedSession.guidance[currentGuidance]}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopSession}
          >
            <Ionicons name="stop" size={32} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sessionsList: {
    flex: 1,
    padding: 20,
  },
  sessionCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sessionDuration: {
    fontSize: 16,
    color: '#666',
  },
  sessionDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  activeSession: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  breathingContainer: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  breathingBall: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: '#FF6B6B',
  },
  guidanceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  guidanceText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 28,
  },
  stopButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});

export default MeditationSection; 