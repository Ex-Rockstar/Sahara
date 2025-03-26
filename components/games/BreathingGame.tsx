import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.7;

interface BreathingPhase {
  name: string;
  duration: number;
  instruction: string;
}

const BREATHING_PHASES: BreathingPhase[] = [
  { name: 'Inhale', duration: 4000, instruction: 'Breathe in slowly' },
  { name: 'Hold', duration: 4000, instruction: 'Hold your breath' },
  { name: 'Exhale', duration: 4000, instruction: 'Breathe out slowly' },
];

export default function BreathingGame() {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [cycles, setCycles] = useState(0);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      startBreathingCycle();
    }
  }, [isActive, currentPhase]);

  const startBreathingCycle = () => {
    const phase = BREATHING_PHASES[currentPhase];
    
    // Reset animations
    scaleAnim.setValue(1);
    opacityAnim.setValue(1);

    // Animate based on phase
    switch (phase.name) {
      case 'Inhale':
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: phase.duration,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration: phase.duration,
            useNativeDriver: true,
          }),
        ]).start();
        break;
      case 'Hold':
        // Keep the circle expanded
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 100,
          useNativeDriver: true,
        }).start();
        break;
      case 'Exhale':
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: phase.duration,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: phase.duration,
            useNativeDriver: true,
          }),
        ]).start();
        break;
    }

    // Move to next phase after duration
    setTimeout(() => {
      if (currentPhase === BREATHING_PHASES.length - 1) {
        setCurrentPhase(0);
        setCycles(prev => prev + 1);
      } else {
        setCurrentPhase(prev => prev + 1);
      }
    }, phase.duration);
  };

  const toggleBreathing = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setCurrentPhase(0);
      setCycles(0);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Breathing Exercise</Text>
        <Text style={styles.cycles}>Cycles: {cycles}</Text>
      </View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Text style={styles.phaseName}>
            {BREATHING_PHASES[currentPhase].name}
          </Text>
          <Text style={styles.instruction}>
            {BREATHING_PHASES[currentPhase].instruction}
          </Text>
        </Animated.View>

        <TouchableOpacity
          style={[styles.controlButton, isActive && styles.activeButton]}
          onPress={toggleBreathing}
        >
          <Ionicons
            name={isActive ? 'pause' : 'play'}
            size={32}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F2',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#3E3E3E',
  },
  cycles: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#6D597A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#F4D06F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  phaseName: {
    fontSize: 32,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#3E3E3E',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 18,
    fontFamily: 'Lora',
    color: '#6D597A',
    textAlign: 'center',
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E29578',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 48,
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  activeButton: {
    backgroundColor: '#6D597A',
  },
}); 