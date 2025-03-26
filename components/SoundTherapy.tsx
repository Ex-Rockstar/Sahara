import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

interface Sound {
  id: string;
  name: string;
  icon: string;
  source: any;
  description: string;
}

const SOUNDS: Sound[] = [
  {
    id: 'rain',
    name: 'Rain',
    icon: 'rainy',
    source: require('../assets/sounds/rain.mp3'),
    description: 'Gentle rain sounds to help you relax',
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    icon: 'water',
    source: require('../assets/sounds/ocean.mp3'),
    description: 'Calming ocean waves for deep relaxation',
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: 'leaf',
    source: require('../assets/sounds/forest.mp3'),
    description: 'Peaceful forest ambiance with birds and wind',
  },
  {
    id: 'fire',
    name: 'Fire',
    icon: 'flame',
    source: require('../assets/sounds/fireplace.mp3'),
    description: 'Crackling fire sounds for warmth and comfort',
  },
];

const TIMER_OPTIONS = [5, 10, 30];

const SoundTherapy: React.FC = () => {
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [selectedTimer, setSelectedTimer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  const playSound = async (selectedSound: Sound) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(selectedSound.source, {
        shouldPlay: true,
        isLooping: true,
        volume: volume,
      });
      setSound(newSound);
      setSelectedSound(selectedSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const stopSound = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      setSound(null);
      setSelectedSound(null);
      setIsPlaying(false);
      setTimeLeft(0);
      setSelectedTimer(null);
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  };

  const togglePlayPause = async () => {
    if (!selectedSound) return;

    try {
      if (isPlaying) {
        await sound?.pauseAsync();
      } else {
        await sound?.playAsync();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const handleVolumeChange = async (value: number) => {
    setVolume(value);
    if (sound) {
      await sound.setVolumeAsync(value);
    }
  };

  const setTimer = (minutes: number) => {
    setSelectedTimer(minutes);
    setTimeLeft(minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.soundsList}>
        {SOUNDS.map((sound) => (
          <TouchableOpacity
            key={sound.id}
            style={[
              styles.soundCard,
              selectedSound?.id === sound.id && styles.selectedSound,
            ]}
            onPress={() => playSound(sound)}
          >
            <Ionicons
              name={sound.icon as any}
              size={32}
              color={selectedSound?.id === sound.id ? '#FF6B6B' : '#666'}
            />
            <View style={styles.soundInfo}>
              <Text
                style={[
                  styles.soundName,
                  selectedSound?.id === sound.id && styles.selectedSoundText,
                ]}
              >
                {sound.name}
              </Text>
              <Text style={styles.soundDescription}>{sound.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedSound && (
        <View style={styles.controls}>
          <View style={styles.timerOptions}>
            {TIMER_OPTIONS.map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={[
                  styles.timerButton,
                  selectedTimer === minutes && styles.selectedTimer,
                ]}
                onPress={() => setTimer(minutes)}
              >
                <Text
                  style={[
                    styles.timerButtonText,
                    selectedTimer === minutes && styles.selectedTimerText,
                  ]}
                >
                  {minutes}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {timeLeft > 0 && (
            <Text style={styles.timeLeft}>{formatTime(timeLeft)}</Text>
          )}

          <View style={styles.volumeControl}>
            <Ionicons name="volume-low" size={24} color="#666" />
            <Slider
              style={styles.volumeSlider}
              value={volume}
              onValueChange={handleVolumeChange}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor="#FF6B6B"
              maximumTrackTintColor="#E0E0E0"
            />
            <Ionicons name="volume-high" size={24} color="#666" />
          </View>

          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayPause}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color="#FF6B6B"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopSound}
          >
            <Ionicons name="stop" size={24} color="#FF6B6B" />
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
  soundsList: {
    flex: 1,
    padding: 20,
  },
  soundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  selectedSound: {
    backgroundColor: '#FFF5F5',
  },
  soundInfo: {
    marginLeft: 16,
    flex: 1,
  },
  soundName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedSoundText: {
    color: '#FF6B6B',
  },
  soundDescription: {
    fontSize: 14,
    color: '#666',
  },
  controls: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  timerOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 8,
  },
  selectedTimer: {
    backgroundColor: '#FF6B6B',
  },
  timerButtonText: {
    color: '#666',
  },
  selectedTimerText: {
    color: '#fff',
  },
  timeLeft: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  volumeSlider: {
    flex: 1,
    marginHorizontal: 12,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  stopButton: {
    alignSelf: 'center',
    padding: 8,
  },
});

export default SoundTherapy; 