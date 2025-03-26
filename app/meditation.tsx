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

const MEDITATION_TYPES = [
  {
    id: 'mindfulness',
    title: 'Mindfulness',
    description: 'Focus on the present moment with guided breathing exercises',
    duration: '10 min',
    icon: '🌿',
  },
  {
    id: 'stress',
    title: 'Stress Relief',
    description: 'Release tension and anxiety with calming meditation techniques',
    duration: '15 min',
    icon: '🌸',
  },
  {
    id: 'sleep',
    title: 'Better Sleep',
    description: 'Drift into peaceful sleep with soothing guided meditation',
    duration: '20 min',
    icon: '🌙',
  },
  {
    id: 'focus',
    title: 'Focus & Clarity',
    description: 'Enhance concentration and mental clarity through meditation',
    duration: '12 min',
    icon: '🎯',
  },
];

export default function MeditationScreen() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F7F5F2', '#F4D06F']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Meditation</Text>
            <Text style={styles.subtitle}>Find your inner peace</Text>
          </View>

          <View style={styles.content}>
            {MEDITATION_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.meditationCard,
                  selectedType === type.id && styles.selectedCard,
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{type.icon}</Text>
                  <Text style={styles.cardTitle}>{type.title}</Text>
                </View>
                <Text style={styles.cardDescription}>{type.description}</Text>
                <View style={styles.cardFooter}>
                  <View style={styles.durationContainer}>
                    <Ionicons name="time-outline" size={16} color="#E29578" />
                    <Text style={styles.duration}>{type.duration}</Text>
                  </View>
                  <TouchableOpacity style={styles.startButton}>
                    <Text style={styles.startButtonText}>Start</Text>
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
  meditationCard: {
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
  startButton: {
    backgroundColor: '#E29578',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
}); 