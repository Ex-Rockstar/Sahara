import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface TimerState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  mode: 'focus' | 'break';
}

export const PomodoroTimer: React.FC = () => {
  const [timer, setTimer] = useState<TimerState>({
    minutes: 25,
    seconds: 0,
    isRunning: false,
    mode: 'focus',
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Request notification permissions
    Notifications.requestPermissionsAsync();

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (!timer.isRunning) {
      setTimer(prev => ({ ...prev, isRunning: true }));
      intervalRef.current = setInterval(updateTimer, 1000);
    }
  };

  const pauseTimer = () => {
    if (timer.isRunning) {
      setTimer(prev => ({ ...prev, isRunning: false }));
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimer({
      minutes: timer.mode === 'focus' ? 25 : 5,
      seconds: 0,
      isRunning: false,
      mode: timer.mode,
    });
  };

  const updateTimer = () => {
    setTimer(prev => {
      if (prev.seconds === 0) {
        if (prev.minutes === 0) {
          // Timer completed
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          const newMode = prev.mode === 'focus' ? 'break' : 'focus';
          const newMinutes = newMode === 'focus' ? 25 : 5;
          
          // Schedule notification
          Notifications.scheduleNotificationAsync({
            content: {
              title: `${prev.mode === 'focus' ? 'Focus' : 'Break'} session completed!`,
              body: `Time for a ${prev.mode === 'focus' ? 'break' : 'focus'} session.`,
            },
            trigger: null,
          });

          return {
            minutes: newMinutes,
            seconds: 0,
            isRunning: false,
            mode: newMode,
          };
        }
        return {
          ...prev,
          minutes: prev.minutes - 1,
          seconds: 59,
        };
      }
      return {
        ...prev,
        seconds: prev.seconds - 1,
      };
    });
  };

  const toggleMode = () => {
    if (!timer.isRunning) {
      const newMode = timer.mode === 'focus' ? 'break' : 'focus';
      setTimer({
        minutes: newMode === 'focus' ? 25 : 5,
        seconds: 0,
        isRunning: false,
        mode: newMode,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerCircle}>
        <Text style={styles.timeText}>{formatTime(timer.minutes * 60 + timer.seconds)}</Text>
        <Text style={styles.phaseText}>
          {timer.mode === 'focus' ? 'Focus Time' : 'Break Time'}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleMode} style={styles.button}>
          <Text style={styles.buttonText}>
            {timer.mode === 'focus' ? 'Focus Mode' : 'Break Mode'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={timer.isRunning ? pauseTimer : startTimer}
          style={[styles.button, timer.isRunning ? styles.pauseButton : styles.startButton]}
        >
          <Text style={styles.buttonText}>
            {timer.isRunning ? 'Pause' : 'Start'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={resetTimer}
          style={[styles.button, styles.resetButton]}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  phaseText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  resetButton: {
    backgroundColor: '#f44336',
  },
}); 