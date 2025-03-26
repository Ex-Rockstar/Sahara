import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

interface SoundPlayerProps {
  uri: string;
  title: string;
  onClose: () => void;
}

export const SoundPlayer: React.FC<SoundPlayerProps> = ({ uri, title, onClose }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [timer, setTimer] = useState(30); // Default 30 minutes
  const [timeRemaining, setTimeRemaining] = useState(timer * 60);

  useEffect(() => {
    loadSound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [uri]);

  const loadSound = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false }
      );
      setSound(newSound);
      
      const status = await newSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;
    
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
      startTimer();
    }
    setIsPlaying(!isPlaying);
  };

  const stopSound = async () => {
    if (!sound) return;
    await sound.stopAsync();
    await sound.setPositionAsync(0);
    setIsPlaying(false);
    setTimeRemaining(timer * 60);
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          stopSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onSliderChange = (value: number) => {
    setTimer(value);
    setTimeRemaining(value * 60);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={togglePlayPause}>
          <Ionicons
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={60}
            color="#FF6B6B"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={stopSound}>
          <Ionicons name="stop-circle" size={60} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Timer: {timer} minutes</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={120}
          value={timer}
          onValueChange={onSliderChange}
          minimumTrackTintColor="#FF6B6B"
          maximumTrackTintColor="#ddd"
        />
        <Text style={styles.timeRemaining}>
          Time Remaining: {formatTime(timeRemaining)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    marginBottom: 24,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRemaining: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
}); 