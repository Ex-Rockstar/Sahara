import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';

const SOUND_TYPES = [
  {
    id: 'rain',
    title: 'Rain Sounds',
    description: 'Gentle rain and thunder for deep relaxation',
    duration: '30 min',
    icon: '🌧️',
  },
  {
    id: 'ocean',
    title: 'Ocean Waves',
    description: 'Calming ocean waves for stress relief',
    duration: '30 min',
    icon: '🌊',
  },
  {
    id: 'forest',
    title: 'Forest Ambience',
    description: 'Peaceful forest sounds with birds and wind',
    duration: '30 min',
    icon: '🌳',
  },
  {
    id: 'white-noise',
    title: 'White Noise',
    description: 'Soothing white noise for focus and sleep',
    duration: '30 min',
    icon: '🌫️',
  },
];

export default function SoundTherapyScreen() {
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F7F5F2', '#F4D06F']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Sound Therapy</Text>
            <Text style={styles.subtitle}>Find your calm through sound</Text>
          </View>

          <View style={styles.content}>
            {SOUND_TYPES.map((sound) => (
              <TouchableOpacity
                key={sound.id}
                style={[
                  styles.soundCard,
                  selectedSound === sound.id && styles.selectedCard,
                ]}
                onPress={() => setSelectedSound(sound.id)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{sound.icon}</Text>
                  <Text style={styles.cardTitle}>{sound.title}</Text>
                </View>
                <Text style={styles.cardDescription}>{sound.description}</Text>
                <View style={styles.cardFooter}>
                  <View style={styles.durationContainer}>
                    <Ionicons name="time-outline" size={16} color="#E29578" />
                    <Text style={styles.duration}>{sound.duration}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.playButton,
                      isPlaying && styles.pauseButton,
                    ]}
                    onPress={() => setIsPlaying(!isPlaying)}
                  >
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={24}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
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
  header: {
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#3E3E3E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Lora',
    color: '#6D597A',
  },
  content: {
    padding: 16,
  },
  soundCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#F4D06F',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#3E3E3E',
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: 'Lora',
    color: '#6D597A',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#E29578',
    marginLeft: 4,
  },
  playButton: {
    backgroundColor: '#E29578',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pauseButton: {
    backgroundColor: '#6D597A',
  },
}); 