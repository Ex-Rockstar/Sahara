import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { useRouter } from 'expo-router';

const therapyOptions = [
  {
    id: 'sound',
    title: 'Sound Therapy',
    icon: 'musical-notes',
    description: 'Calming soundscapes for relaxation',
    color: '#4A90E2',
  },
  {
    id: 'meditation',
    title: 'Guided Meditation',
    icon: 'leaf',
    description: 'Short meditation sessions with guidance',
    color: '#50E3C2',
  },
  {
    id: 'breathing',
    title: 'Breathing Exercises',
    icon: 'water',
    description: 'Interactive breathing guides',
    color: '#F5A623',
  },
  {
    id: 'muscle',
    title: 'Muscle Relaxation',
    icon: 'fitness',
    description: 'Progressive muscle relaxation guide',
    color: '#9013FE',
  },
  {
    id: 'visualization',
    title: 'Visualization Therapy',
    icon: 'eye',
    description: 'Guided positive imagery sessions',
    color: '#7ED321',
  },
  {
    id: 'affirmations',
    title: 'Self-Affirmations',
    icon: 'heart',
    description: 'Positive affirmations for healing',
    color: '#D0021B',
  },
];

export default function QuickTherapyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F4D06F', '#E29578']}
        style={styles.header}
      >
        <Text style={styles.title}>Quick Therapy</Text>
        <Text style={styles.subtitle}>Find your moment of calm</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.grid}>
          {therapyOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.card, { backgroundColor: option.color }]}
              onPress={() => router.push(`/quick-therapy/${option.id}`)}
            >
              <View style={styles.cardContent}>
                <Ionicons name={option.icon as any} size={32} color="#FFF" />
                <Text style={styles.cardTitle}>{option.title}</Text>
                <Text style={styles.cardDescription}>{option.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Poppins',
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#FFF',
    marginTop: 12,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#FFF',
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
}); 