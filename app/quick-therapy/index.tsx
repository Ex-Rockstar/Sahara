import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function QuickTherapyScreen() {
  const router = useRouter();

  const therapyOptions = [
    {
      id: 'sound',
      title: 'Sound Therapy',
      description: 'Listen to calming sounds and music',
      icon: 'musical-notes',
      route: '/quick-therapy/sound',
      gradient: ['#FF6B6B', '#FF8E8E'] as const,
    },
    {
      id: 'meditation',
      title: 'Guided Meditation',
      description: 'Find peace through guided meditation',
      icon: 'leaf',
      route: '/quick-therapy/meditation',
      gradient: ['#4ECDC4', '#45B7AF'] as const,
    },
    {
      id: 'affirmations',
      title: 'Self Affirmations',
      description: 'Boost your confidence with positive affirmations',
      icon: 'heart',
      route: '/quick-therapy/affirmations',
      gradient: ['#FFD93D', '#FFE566'] as const,
    },
    {
      id: 'breathing',
      title: 'Breathing Exercises',
      description: 'Calm your mind with breathing techniques',
      icon: 'lungs',
      route: '/quick-therapy/breathing',
      gradient: ['#6C5CE7', '#8A7FF7'] as const,
    },
    {
      id: 'burn-thoughts',
      title: 'Burn Your Thoughts',
      description: 'Write and burn your negative thoughts',
      icon: 'flame',
      route: '/quick-therapy/burn-thoughts',
      gradient: ['#FF6B00', '#FF8C00'] as const,
    },
    {
      id: 'sand-drawing',
      title: 'Sand Drawing',
      description: 'Draw in virtual sand and watch it fade away',
      icon: 'water',
      route: '/quick-therapy/sand-drawing',
      gradient: ['#E6B17A', '#D4A373'] as const,
    },
  ];

  return (
    <LinearGradient
      colors={['#F5E6D3', '#E6D5C7']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Quick Therapy</Text>
          <Text style={styles.subtitle}>Choose a therapy option to begin</Text>
        </View>

        <View style={styles.optionsContainer}>
          {therapyOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => router.push(option.route)}
            >
              <LinearGradient
                colors={option.gradient}
                style={styles.optionGradient}
              >
                <Ionicons name={option.icon as any} size={40} color="#B68D65" />
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(245, 230, 211, 0.7)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B68D65',
    marginBottom: 10,
    textShadowColor: 'rgba(182, 141, 101, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B7355',
    textAlign: 'center',
    textShadowColor: 'rgba(139, 115, 85, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  optionsContainer: {
    padding: 15,
  },
  optionCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#B68D65',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#E6D5C7',
  },
  optionGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B7355',
    marginBottom: 5,
    textShadowColor: 'rgba(139, 115, 85, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  optionDescription: {
    fontSize: 14,
    color: '#8B7355',
    textShadowColor: 'rgba(139, 115, 85, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
}); 