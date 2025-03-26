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

interface Meditation {
  id: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  uri: string;
}

// Meditation file mapping
const meditationFiles = {
  'mindful-breathing.mp3': require('../../assets/meditation/mindful-breathing.mp3'),
  'body-scan.mp3': require('../../assets/meditation/body-scan.mp3'),
  'stress-relief.mp3': require('../../assets/meditation/stress-relief.mp3'),
};

const meditations: Meditation[] = [
  {
    id: 'mindful-breathing',
    title: 'Mindful Breathing',
    category: 'calm',
    duration: '10 min',
    description: 'A guided meditation focusing on breath awareness to cultivate calm and presence',
    uri: 'mindful-breathing.mp3',
  },
  {
    id: 'body-scan',
    title: 'Body Scan',
    category: 'sleep',
    duration: '15 min',
    description: 'A relaxing body scan meditation to release tension and prepare for sleep',
    uri: 'body-scan.mp3',
  },
  {
    id: 'stress-relief',
    title: 'Stress Relief',
    category: 'anxiety',
    duration: '12 min',
    description: 'A calming meditation to reduce stress and anxiety',
    uri: 'stress-relief.mp3',
  },
];

const categories = [
  { id: 'calm', name: 'Calm', icon: 'leaf' },
  { id: 'sleep', name: 'Sleep', icon: 'moon' },
  { id: 'anxiety', name: 'Anxiety', icon: 'heart' },
];

export default function MeditationScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playMeditation = async (meditationUri: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const meditationFile = meditationFiles[meditationUri as keyof typeof meditationFiles];
      if (!meditationFile) {
        console.error('Meditation file not found:', meditationUri);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        meditationFile,
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing meditation:', error);
    }
  };

  const stopMeditation = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error stopping meditation:', error);
    }
  };

  const filteredMeditations = selectedCategory
    ? meditations.filter((meditation) => meditation.category === selectedCategory)
    : meditations;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#50E3C2', '#357ABD']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Guided Meditation</Text>
        <Text style={styles.subtitle}>Find your inner peace</Text>
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
                color={selectedCategory === category.id ? '#50E3C2' : '#666'}
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

        <View style={styles.meditationsList}>
          {filteredMeditations.map((meditation) => (
            <TouchableOpacity
              key={meditation.id}
              style={[
                styles.meditationCard,
                selectedMeditation?.id === meditation.id && styles.selectedMeditation,
              ]}
              onPress={() => {
                setSelectedMeditation(meditation);
                if (isPlaying) {
                  stopMeditation();
                } else {
                  playMeditation(meditation.uri);
                }
              }}
            >
              <View style={styles.meditationInfo}>
                <Text style={styles.meditationTitle}>{meditation.title}</Text>
                <Text style={styles.meditationDuration}>{meditation.duration}</Text>
                <Text style={styles.meditationDescription} numberOfLines={2}>
                  {meditation.description}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => {
                  setSelectedMeditation(meditation);
                  setShowInfoModal(true);
                }}
              >
                <Ionicons name="information-circle" size={24} color="#50E3C2" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selectedMeditation && (
        <View style={styles.player}>
          <View style={styles.meditationInfo}>
            <Text style={styles.currentTitle}>{selectedMeditation.title}</Text>
            <Text style={styles.currentDuration}>{selectedMeditation.duration}</Text>
          </View>
          <TouchableOpacity
            style={styles.playButton}
            onPress={isPlaying ? stopMeditation : () => playMeditation(selectedMeditation.uri)}
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
        visible={showInfoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedMeditation?.title}
              </Text>
              <TouchableOpacity
                onPress={() => setShowInfoModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDuration}>
              Duration: {selectedMeditation?.duration}
            </Text>
            <Text style={styles.modalDescription}>
              {selectedMeditation?.description}
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                setShowInfoModal(false);
                if (selectedMeditation) {
                  playMeditation(selectedMeditation.uri);
                }
              }}
            >
              <Text style={styles.startButtonText}>Start Meditation</Text>
            </TouchableOpacity>
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
    color: '#50E3C2',
    fontWeight: '600',
  },
  meditationsList: {
    gap: 16,
  },
  meditationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedMeditation: {
    backgroundColor: '#E8F2FF',
    borderWidth: 2,
    borderColor: '#50E3C2',
  },
  meditationInfo: {
    flex: 1,
  },
  meditationTitle: {
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  meditationDuration: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#50E3C2',
    marginBottom: 8,
  },
  meditationDescription: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#666',
    lineHeight: 20,
  },
  infoButton: {
    padding: 8,
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
  currentTitle: {
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  currentDuration: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#50E3C2',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#50E3C2',
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  modalDuration: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#50E3C2',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#50E3C2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#FFF',
  },
}); 