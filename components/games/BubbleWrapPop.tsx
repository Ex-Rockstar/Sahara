import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Animated,
  Easing,
  SafeAreaView,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, G } from 'react-native-svg';

const { width } = Dimensions.get('window');
const BUBBLE_SIZE = width / 4; // Made bubbles bigger
const GRID_SIZE = 5; // 5x3 grid for 15 bubbles
const TOTAL_BUBBLES = 15;
const POP_ANIMATION_DURATION = 200;
const REAPPEAR_DELAY = 1000;

interface Bubble {
  id: number;
  isPopped: boolean;
  scale: Animated.Value;
  opacity: Animated.Value;
  reappearScale: Animated.Value;
}

const BubbleWrapPop: React.FC = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [popSound, setPopSound] = useState<Audio.Sound | null>(null);
  const [reappearSound, setReappearSound] = useState<Audio.Sound | null>(null);
  const [soundsLoaded, setSoundsLoaded] = useState(false);

  useEffect(() => {
    initializeBubbles();
    loadSounds();
    return () => {
      cleanupSounds();
    };
  }, []);

  const loadSounds = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const popSoundModule = require('../../assets/sounds/bubble-pop.mp3');
      const reappearSoundModule = require('../../assets/sounds/bubble-reappear.mp3');

      if (!popSoundModule || !reappearSoundModule) {
        console.error('Sound modules are undefined');
        return;
      }

      const { sound: pop } = await Audio.Sound.createAsync(popSoundModule, {
        volume: 0.5,
        shouldPlay: false,
      });
      const { sound: reappear } = await Audio.Sound.createAsync(reappearSoundModule, {
        volume: 0.3,
        shouldPlay: false,
      });

      setPopSound(pop);
      setReappearSound(reappear);
      setSoundsLoaded(true);
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  };

  const cleanupSounds = async () => {
    try {
      if (popSound) {
        await popSound.unloadAsync();
        await popSound.stopAsync();
      }
      if (reappearSound) {
        await reappearSound.unloadAsync();
        await reappearSound.stopAsync();
      }
    } catch (error) {
      console.error('Error cleaning up sounds:', error);
    }
  };

  const playPopSound = async () => {
    if (!soundsLoaded) return;
    try {
      if (popSound) {
        await popSound.setPositionAsync(0);
        await popSound.playAsync();
      }
    } catch (error) {
      console.error('Error playing pop sound:', error);
    }
  };

  const playReappearSound = async () => {
    if (!soundsLoaded) return;
    try {
      if (reappearSound) {
        await reappearSound.setPositionAsync(0);
        await reappearSound.playAsync();
      }
    } catch (error) {
      console.error('Error playing reappear sound:', error);
    }
  };

  const initializeBubbles = () => {
    const newBubbles: Bubble[] = Array.from({ length: TOTAL_BUBBLES }, (_, index) => ({
      id: index,
      isPopped: false,
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
      reappearScale: new Animated.Value(0.8),
    }));
    setBubbles(newBubbles);
    setPoppedCount(0);
  };

  const popBubble = (bubbleId: number) => {
    const updatedBubbles = bubbles.map((bubble) => {
      if (bubble.id === bubbleId && !bubble.isPopped) {
        // Trigger haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Pop animation
        Animated.parallel([
          Animated.timing(bubble.scale, {
            toValue: 1.2,
            duration: POP_ANIMATION_DURATION,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bubble.opacity, {
            toValue: 0,
            duration: POP_ANIMATION_DURATION,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();

        // Play pop sound
        playPopSound();

        // Reappear after delay
        setTimeout(() => {
          Animated.parallel([
            Animated.spring(bubble.scale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }),
            Animated.timing(bubble.opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
          playReappearSound();
          
          // Reset isPopped state after reappearing
          setBubbles(prevBubbles => 
            prevBubbles.map(b => 
              b.id === bubbleId ? { ...b, isPopped: false } : b
            )
          );
        }, REAPPEAR_DELAY);

        return { ...bubble, isPopped: true };
      }
      return bubble;
    });

    setBubbles(updatedBubbles);
    setPoppedCount((prev) => prev + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bubble Wrap Pop</Text>
        <Text style={styles.counter}>Popped: {poppedCount}</Text>
      </View>
      <View style={styles.grid}>
        {bubbles.map((bubble) => (
          <Animated.View
            key={bubble.id}
            style={[
              styles.bubbleContainer,
              {
                transform: [{ scale: bubble.scale }],
                opacity: bubble.opacity,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.bubble}
              onPress={() => popBubble(bubble.id)}
              disabled={bubble.isPopped}
            >
              <Svg width={BUBBLE_SIZE} height={BUBBLE_SIZE}>
                <G>
                  <Circle
                    cx={BUBBLE_SIZE / 2}
                    cy={BUBBLE_SIZE / 2}
                    r={BUBBLE_SIZE / 2 - 4}
                    fill="#FF6B6B"
                    stroke="#FF8787"
                    strokeWidth="4"
                  />
                  <Circle
                    cx={BUBBLE_SIZE / 2 - 8}
                    cy={BUBBLE_SIZE / 2 - 8}
                    r={4}
                    fill="#FFE5E5"
                    opacity={0.8}
                  />
                </G>
              </Svg>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  counter: {
    fontSize: 18,
    color: '#666',
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  bubbleContainer: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BubbleWrapPop; 