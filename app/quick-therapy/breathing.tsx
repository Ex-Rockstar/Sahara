import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../../components/BottomNavBar';
import { useRouter } from 'expo-router';

interface BreathingTechnique {
  id: string;
  name: string;
  description: string;
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  holdAfterExhale: number;
  color: string;
}

const breathingTechniques: BreathingTechnique[] = [
  {
    id: '478',
    name: '4-7-8 Breathing',
    description: 'A relaxing breathing technique that helps reduce stress and anxiety',
    inhaleTime: 4,
    holdTime: 7,
    exhaleTime: 8,
    holdAfterExhale: 0,
    color: '#F5A623',
  },
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal duration breathing to regain focus and balance',
    inhaleTime: 4,
    holdTime: 4,
    exhaleTime: 4,
    holdAfterExhale: 4,
    color: '#50E3C2',
  },
  {
    id: 'belly',
    name: 'Belly Breathing',
    description: 'Deep diaphragmatic breathing for relaxation',
    inhaleTime: 4,
    holdTime: 0,
    exhaleTime: 4,
    holdAfterExhale: 0,
    color: '#9013FE',
  },
];

export default function BreathingScreen() {
  const router = useRouter();
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdAfterExhale'>('inhale');
  const [breathAnimation] = useState(new Animated.Value(0));
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && selectedTechnique) {
      startBreathingCycle();
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isActive, selectedTechnique]);

  const startBreathingCycle = () => {
    const { inhaleTime, holdTime, exhaleTime, holdAfterExhale } = selectedTechnique!;
    const totalCycle = inhaleTime + holdTime + exhaleTime + holdAfterExhale;

    // Inhale animation
    Animated.timing(breathAnimation, {
      toValue: 1,
      duration: inhaleTime * 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Hold after inhale
    if (holdTime > 0) {
      setTimeout(() => {
        setCurrentPhase('hold');
        setTimeout(() => {
          // Exhale animation
          Animated.timing(breathAnimation, {
            toValue: 0,
            duration: exhaleTime * 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }).start();

          // Hold after exhale
          if (holdAfterExhale > 0) {
            setTimeout(() => {
              setCurrentPhase('holdAfterExhale');
              const nextCycle = setTimeout(() => {
                setCurrentPhase('inhale');
                if (isActive) {
                  startBreathingCycle();
                }
              }, holdAfterExhale * 1000);
              setTimer(nextCycle);
            }, exhaleTime * 1000);
          } else {
            const nextCycle = setTimeout(() => {
              setCurrentPhase('inhale');
              if (isActive) {
                startBreathingCycle();
              }
            }, exhaleTime * 1000);
            setTimer(nextCycle);
          }
        }, holdTime * 1000);
      }, inhaleTime * 1000);
    } else {
      // If no hold time, go straight to exhale
      setTimeout(() => {
        setCurrentPhase('exhale');
        Animated.timing(breathAnimation, {
          toValue: 0,
          duration: exhaleTime * 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start();

        const nextCycle = setTimeout(() => {
          setCurrentPhase('inhale');
          if (isActive) {
            startBreathingCycle();
          }
        }, exhaleTime * 1000);
        setTimer(nextCycle);
      }, inhaleTime * 1000);
    }
  };

  const stopBreathing = () => {
    setIsActive(false);
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
    breathAnimation.setValue(0);
    setCurrentPhase('inhale');
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Inhale';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Exhale';
      case 'holdAfterExhale':
        return 'Hold';
      default:
        return 'Start';
    }
  };

  const getPhaseColor = () => {
    if (!selectedTechnique) return '#F5A623';
    switch (currentPhase) {
      case 'inhale':
        return selectedTechnique.color;
      case 'hold':
        return '#666';
      case 'exhale':
        return '#50E3C2';
      case 'holdAfterExhale':
        return '#666';
      default:
        return selectedTechnique.color;
    }
  };

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
        <Text style={styles.title}>Breathing Exercises</Text>
        <Text style={styles.subtitle}>Find your rhythm</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.techniquesList}>
          {breathingTechniques.map((technique) => (
            <TouchableOpacity
              key={technique.id}
              style={[
                styles.techniqueCard,
                selectedTechnique?.id === technique.id && styles.selectedTechnique,
              ]}
              onPress={() => {
                setSelectedTechnique(technique);
                setIsActive(false);
                breathAnimation.setValue(0);
              }}
            >
              <View style={styles.techniqueHeader}>
                <View style={[styles.techniqueIcon, { backgroundColor: `${technique.color}20` }]}>
                  <Ionicons name="leaf" size={24} color={technique.color} />
                </View>
                <View style={styles.techniqueInfo}>
                  <Text style={styles.techniqueName}>{technique.name}</Text>
                  <Text style={styles.techniqueDescription} numberOfLines={2}>
                    {technique.description}
                  </Text>
                </View>
              </View>
              <View style={styles.timingInfo}>
                <View style={styles.timingItem}>
                  <Ionicons name="time" size={16} color="#666" />
                  <Text style={styles.timingText}>
                    Inhale: {technique.inhaleTime}s
                    {technique.holdTime > 0 && ` • Hold: ${technique.holdTime}s`}
                    • Exhale: {technique.exhaleTime}s
                    {technique.holdAfterExhale > 0 && ` • Hold: ${technique.holdAfterExhale}s`}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selectedTechnique && (
        <View style={styles.breathingGuide}>
          <View style={styles.breathingCircleContainer}>
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  transform: [
                    {
                      scale: breathAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.5],
                      }),
                    },
                  ],
                  backgroundColor: getPhaseColor(),
                },
              ]}
            >
              <Text style={styles.phaseText}>{getPhaseText()}</Text>
            </Animated.View>
            <View style={styles.breathingInstructions}>
              <Text style={styles.instructionText}>Follow the circle's rhythm</Text>
              <Text style={styles.instructionSubtext}>Breathe in as it expands, out as it contracts</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: selectedTechnique.color }]}
            onPress={isActive ? stopBreathing : () => setIsActive(true)}
          >
            <Ionicons
              name={isActive ? 'stop' : 'play'}
              size={24}
              color="#FFF"
              style={styles.controlButtonIcon}
            />
            <Text style={styles.controlButtonText}>
              {isActive ? 'Stop' : 'Start'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
  techniquesList: {
    gap: 16,
  },
  techniqueCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedTechnique: {
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  techniqueHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  techniqueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  techniqueInfo: {
    flex: 1,
    gap: 4,
  },
  techniqueName: {
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#333',
  },
  techniqueDescription: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#666',
    lineHeight: 20,
  },
  timingInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  timingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timingText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#666',
  },
  breathingGuide: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E29578',
  },
  breathingCircleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  phaseText: {
    fontSize: 24,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#FFF',
  },
  breathingInstructions: {
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  instructionSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#666',
    textAlign: 'center',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButtonIcon: {
    marginRight: 8,
  },
  controlButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#FFF',
  },
}); 