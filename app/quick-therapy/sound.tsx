import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../../components/BottomNavBar';
import { useRouter } from 'expo-router';

interface Sound {
  id: string;
  name: string;
  category: string;
  icon: string;
  uri: string;
}

// Sound file mapping
const soundFiles = {
  'rain-gentle.mp3': require('../../assets/sounds/rain-gentle.mp3'),
  'rain-thunder.mp3': require('../../assets/sounds/rain-thunder.mp3'),
  'rain-drizzle.mp3': require('../../assets/sounds/rain-drizzle.mp3'),
  'ocean-waves.mp3': require('../../assets/sounds/ocean-waves.mp3'),
  'forest-birds.mp3': require('../../assets/sounds/forest-birds.mp3'),
  'leaves.mp3': require('../../assets/sounds/leaves.mp3'),
  'white_noise.mp3': require('../../assets/sounds/white_noise.mp3'),
  'brown_noise.mp3': require('../../assets/sounds/brown_noise.mp3'),
};

const sounds: Sound[] = [
  // Rain Sounds
  { id: 'rain1', name: 'Gentle Rain', category: 'rain', icon: 'rainy', uri: 'rain-gentle.mp3' },
  { id: 'rain2', name: 'Thunderstorm', category: 'rain', icon: 'flash', uri: 'rain-thunder.mp3' },
  { id: 'rain3', name: 'Drizzle', category: 'rain', icon: 'water', uri: 'rain-drizzle.mp3' },
  
  // Nature Sounds
  { id: 'nature1', name: 'Ocean Waves', category: 'nature', icon: 'water', uri: 'ocean-waves.mp3' },
  { id: 'nature2', name: 'Forest Birds', category: 'nature', icon: 'leaf', uri: 'forest-birds.mp3' },
  { id: 'nature3', name: 'Rustling Leaves', category: 'nature', icon: 'leaf', uri: 'leaves.mp3' },
  
  // White Noise
  { id: 'noise1', name: 'White Noise', category: 'noise', icon: 'radio', uri: 'white_noise.mp3' },
  { id: 'noise2', name: 'Brown Noise', category: 'noise', icon: 'radio', uri: 'brown_noise.mp3' },
];

const categories = [
  { id: 'rain', name: 'Rain Sounds', icon: 'rainy' },
  { id: 'nature', name: 'Nature Sounds', icon: 'leaf' },
  { id: 'music', name: 'Instrumental Music', icon: 'musical-notes' },
  { id: 'noise', name: 'White Noise', icon: 'radio' },
];

const timerOptions = [10, 20, 30];

export default function SoundTherapyScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playSound = async (soundUri: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const soundFile = soundFiles[soundUri as keyof typeof soundFiles];
      if (!soundFile) {
        console.error('Sound file not found:', soundUri);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        soundFile,
        { shouldPlay: true, isLooping: true }
      );
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const stopSound = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  };

  const handleTimerSelect = (minutes: number) => {
    setSelectedTimer(minutes);
    setTimeLeft(minutes * 60);
    setShowTimerModal(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timeLeft === 0) {
      stopSound();
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  const filteredSounds = selectedCategory
    ? sounds.filter((sound) => sound.category === selectedCategory)
    : sounds;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Sound Therapy</Text>
        <Text style={styles.subtitle}>Find your perfect soundscape</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.categories}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={24}
                color={selectedCategory === category.id ? '#4A90E2' : '#666'}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.soundsGrid}>
          {filteredSounds.map((sound) => (
            <TouchableOpacity
              key={sound.id}
              style={[
                styles.soundCard,
                selectedSound?.id === sound.id && styles.selectedSound,
              ]}
              onPress={() => {
                setSelectedSound(sound);
                if (isPlaying) {
                  stopSound();
                } else {
                  playSound(sound.uri);
                }
              }}
            >
              <Ionicons name={sound.icon as any} size={32} color="#4A90E2" />
              <Text style={styles.soundName}>{sound.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selectedSound && (
        <View style={styles.player}>
          <TouchableOpacity
            style={styles.timerButton}
            onPress={() => setShowTimerModal(true)}
          >
            <Ionicons name="timer" size={24} color="#4A90E2" />
            <Text style={styles.timerText}>
              {timeLeft ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : 'Set Timer'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={isPlaying ? stopSound : () => playSound(selectedSound.uri)}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showTimerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimerModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Timer</Text>
            <View style={styles.timerOptions}>
              {timerOptions.map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={styles.timerOption}
                  onPress={() => handleTimerSelect(minutes)}
                >
                  <Text style={styles.timerOptionText}>{minutes} minutes</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavBar />
    </SafeAreaView>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#FFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 12,
  },
  selectedCategory: {
    backgroundColor: '#E8F2FF',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#666',
  },
  selectedCategoryText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  soundsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  soundCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedSound: {
    backgroundColor: '#E8F2FF',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  soundName: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#333',
    textAlign: 'center',
  },
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E29578',
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F5F2',
    padding: 12,
    borderRadius: 12,
  },
  timerText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#4A90E2',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  timerOptions: {
    gap: 12,
  },
  timerOption: {
    backgroundColor: '#F7F5F2',
    padding: 16,
    borderRadius: 12,
  },
  timerOptionText: {
    fontSize: 18,
    fontFamily: 'Poppins',
    color: '#4A90E2',
    textAlign: 'center',
  },
}); 