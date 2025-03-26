import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MoodMeterProps {
  value: number;
  onChange: (value: number) => void;
}

const MOODS = [
  { emoji: '😢', label: 'Very Sad', value: 1, color: '#FF6B6B' },
  { emoji: '😕', label: 'Sad', value: 2, color: '#FFA07A' },
  { emoji: '😐', label: 'Neutral', value: 3, color: '#FFD700' },
  { emoji: '🙂', label: 'Happy', value: 4, color: '#98FB98' },
  { emoji: '😄', label: 'Very Happy', value: 5, color: '#90EE90' },
];

export const MoodMeter: React.FC<MoodMeterProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling?</Text>
      <View style={styles.moodContainer}>
        {MOODS.map((mood) => (
          <TouchableOpacity
            key={mood.value}
            style={[
              styles.moodButton,
              value === mood.value && { backgroundColor: mood.color },
            ]}
            onPress={() => onChange(mood.value)}
          >
            <Text style={styles.emoji}>{mood.emoji}</Text>
            <Text style={[
              styles.label,
              value === mood.value && styles.selectedLabel,
            ]}>
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  selectedLabel: {
    color: '#fff',
    fontWeight: '600',
  },
}); 