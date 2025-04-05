import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const GRAIN_SIZE = 2;
const SAND_PARTICLES = 50;
const TRAIL_LENGTH = 3;
const PARTICLE_LIFETIME = 1.5;
const GRAVITY = 0.03;
const FADE_RATE = 0.003;

type SandType = 'beach' | 'desert' | 'moon';

interface SandTypeOption {
  id: SandType;
  name: string;
  color: string;
  gradient: readonly [string, string];
  icon: string;
  texture: any;
  pattern: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const sandTypes: SandTypeOption[] = [
  {
    id: 'beach',
    name: 'Beach Sand',
    color: '#F5E6D3',
    gradient: ['#F5E6D3', '#E6D5C7'] as const,
    icon: 'water',
    // texture: require('../../assets/textures/beach-sand.png'),
    texture: require('../../assets/textures/clay.webp'),
    
    pattern: {
      primary: '#F5E6D3',
      secondary: '#E6D5C7',
      accent: '#D4C4B7',
    },
  },
  {
    id: 'desert',
    name: 'Desert Sand',
    color: '#E6B17A',
    gradient: ['#E6B17A', '#D4A373'] as const,
    icon: 'sunny',
  //  texture: require('../../assets/textures/desert-sand.png'),
  texture: require('../../assets/textures/clay.webp'),

  pattern: {
      primary: '#E6B17A',
      secondary: '#D4A373',
      accent: '#C19A6B',
    },
  },
  {
    id: 'moon',
    name: 'Moon Dust',
    color: '#8B7355',
    gradient: ['#8B7355', '#6B4423'] as const,
    icon: 'moon',
    texture: require('../../assets/textures/clay.webp'),
    pattern: {
      primary: '#8B7355',
      secondary: '#6B4423',
      accent: '#5A4A2E',
    },
  },
];

interface SandParticle {
  x: number;
  y: number;
  scale: Animated.Value;
  opacity: Animated.Value;
  rotation: Animated.Value;
  velocity: { x: number; y: number };
  life: number;
}

const SandDrawingScreen = () => {
  const [selectedSand, setSelectedSand] = useState<SandType>('beach');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<SandParticle[]>([]);
  const [trailPoints, setTrailPoints] = useState<{ x: number; y: number }[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const soundRef = useRef<Audio.Sound | null>(null);

  const createSandParticle = (x: number, y: number): SandParticle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.8 + 0.3;
    return {
      x,
      y,
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
      rotation: new Animated.Value(Math.random() * 360),
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      },
      life: PARTICLE_LIFETIME,
    };
  };

  const updateParticles = () => {
    setParticles(prev => {
      return prev.map(particle => {
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        particle.velocity.y += GRAVITY;
        particle.life -= FADE_RATE;
        particle.opacity.setValue(particle.life);
        return particle;
      }).filter(p => p.life > 0);
    });
  };

  useEffect(() => {
    let animationFrame: number;
    if (isDrawing) {
      const animate = () => {
        updateParticles();
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isDrawing]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        setIsDrawing(true);
        const { locationX, locationY } = event.nativeEvent;
        setLastPoint({ x: locationX, y: locationY });
        setTrailPoints([{ x: locationX, y: locationY }]);
        const newParticles = Array(SAND_PARTICLES).fill(0).map(() => 
          createSandParticle(locationX, locationY)
        );
        setParticles(prev => [...prev, ...newParticles]);
      },
      onPanResponderMove: (event) => {
        const { locationX, locationY } = event.nativeEvent;
        setTrailPoints(prev => {
          const newPoints = [...prev, { x: locationX, y: locationY }];
          return newPoints.slice(-TRAIL_LENGTH);
        });
        
        const newParticles = Array(SAND_PARTICLES).fill(0).map(() => 
          createSandParticle(locationX, locationY)
        );
        
        setParticles(prev => [...prev, ...newParticles]);
        setLastPoint({ x: locationX, y: locationY });
      },
      onPanResponderRelease: () => {
        setIsDrawing(false);
        setTrailPoints([]);
      },
      onPanResponderTerminate: () => {
        setIsDrawing(false);
        setTrailPoints([]);
      },
    })
  ).current;

  const playWindSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/wind.mp3')
      );
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const clearSand = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setParticles([]);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
    playWindSound();
  };

  return (
    <LinearGradient
      colors={sandTypes.find(s => s.id === selectedSand)?.gradient || ['#F5E6D3', '#E6D5C7'] as const}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Sand Drawing</Text>
        <Text style={styles.subtitle}>Draw your thoughts and watch them fade away</Text>
      </View>

      <View style={styles.sandTypesContainer}>
        {sandTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.sandTypeButton,
              selectedSand === type.id && styles.selectedSandType,
              { backgroundColor: type.color },
            ]}
            onPress={() => setSelectedSand(type.id)}
          >
            <Ionicons name={type.icon as any} size={24} color="#FFF" />
            <Text style={styles.sandTypeText}>{type.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.View
        style={[styles.drawingArea, { opacity: fadeAnim }]}
        {...panResponder.panHandlers}
      >
        <Image
          source={sandTypes.find(s => s.id === selectedSand)?.texture}
          style={styles.sandTexture}
        />
        {particles.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.sandParticle,
              {
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                  { scale: particle.scale },
                  { rotate: particle.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  })},
                ],
                opacity: particle.opacity,
                backgroundColor: sandTypes.find(s => s.id === selectedSand)?.pattern[
                  Math.random() > 0.5 ? 'primary' : 'secondary'
                ],
                width: GRAIN_SIZE,
                height: GRAIN_SIZE,
                borderRadius: GRAIN_SIZE / 2,
              },
            ]}
          />
        ))}
      </Animated.View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={clearSand}>
          <Ionicons name="trash-outline" size={24} color="#8B7355" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
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
  },
  sandTypesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    gap: 10,
  },
  sandTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    gap: 5,
  },
  selectedSandType: {
    borderWidth: 2,
    borderColor: '#FFF',
  },
  sandTypeText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  drawingArea: {
    flex: 1,
    backgroundColor: 'transparent',
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sandTexture: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    resizeMode: 'repeat',
  },
  sandParticle: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FDF6E9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default SandDrawingScreen; 