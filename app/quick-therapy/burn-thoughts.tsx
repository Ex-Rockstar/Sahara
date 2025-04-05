import React, { useState, useEffect, useRef, Fragment } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInputProps,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

// Add type declarations for TextInput props
interface CustomTextInputProps extends TextInputProps {
  placeholderTextColor?: string;
}

const FireAnimation = ({ isActive, text }: { isActive: boolean; text: string }) => {
  const [flames] = useState(() => 
    Array(12).fill(0).map(() => ({
      scale: new Animated.Value(1),
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  );

  const [letters] = useState(() => 
    text.split('').map((letter, index) => ({
      letter,
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
      translateY: new Animated.Value(-100),
      translateX: new Animated.Value((index - text.length / 2) * 20),
      rotate: new Animated.Value(0),
    }))
  );

  useEffect(() => {
    if (isActive) {
      // Fire pit animation
      const fireAnimations = flames.map((flame, index) => {
        return Animated.parallel([
          Animated.sequence([
            Animated.timing(flame.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(flame.opacity, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(flame.scale, {
              toValue: 1.8,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(flame.scale, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(flame.translateY, {
            toValue: -100,
            duration: 800,
            useNativeDriver: true,
          }),
        ]);
      });

      // Letter falling and burning animation
      const letterAnimations = letters.map((letter, index) => {
        const randomRotation = Math.random() * 360;
        return Animated.parallel([
          Animated.sequence([
            Animated.timing(letter.translateY, {
              toValue: 250,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(letter.opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(letter.translateX, {
            toValue: (Math.random() - 0.5) * 50,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(letter.rotate, {
            toValue: randomRotation,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(letter.scale, {
            toValue: 0.3,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.parallel([
        Animated.stagger(30, fireAnimations),
        Animated.stagger(50, letterAnimations),
      ]).start();
    }
  }, [isActive]);

  return (
    <View style={styles.fireContainer}>
      <View style={styles.firePit}>
        {flames.map((flame, index) => (
          <Animated.View
            key={`flame-${index}`}
            style={[
              styles.flame,
              {
                transform: [
                  { scale: flame.scale },
                  { translateY: flame.translateY },
                ],
                opacity: flame.opacity,
              },
            ]}
          >
            <FontAwesome name="fire" size={50} color="#FF6B00" />
          </Animated.View>
        ))}
      </View>
      {letters.map((letter, index) => (
        <Animated.Text
          key={`letter-${index}`}
          style={[
            styles.burningLetter,
            {
              transform: [
                { translateY: letter.translateY },
                { translateX: letter.translateX },
                { rotate: letter.rotate.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                })},
                { scale: letter.scale },
              ],
              opacity: letter.opacity,
            },
          ]}
        >
          {letter.letter}
        </Animated.Text>
      ))}
    </View>
  );
};

const AshesAnimation = ({ text }: { text: string }) => {
  const [particles] = useState(() => 
    Array(20).fill(0).map(() => ({
      x: Math.random() * width,
      y: height / 2,
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
      rotate: new Animated.Value(0),
    }))
  );

  useEffect(() => {
    const animations = particles.map((particle) => {
      return Animated.parallel([
        Animated.timing(particle.scale, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(particle.rotate, {
          toValue: Math.random() * 360,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(50, animations).start();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {particles.map((particle, index) => (
        <Animated.Text
          key={index}
          style={[
            styles.ash,
            {
              left: particle.x,
              top: particle.y,
              transform: [
                { scale: particle.scale },
                { rotate: particle.rotate.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                })},
              ],
              opacity: particle.opacity,
            },
          ]}
        >
          {text[Math.floor(Math.random() * text.length)]}
        </Animated.Text>
      ))}
    </View>
  );
};

const SmokeAnimation = () => {
  const [smokeParticles] = useState(() => 
    Array(15).fill(0).map(() => ({
      scale: new Animated.Value(0.1),
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
    }))
  );

  useEffect(() => {
    const animations = smokeParticles.map((particle, index) => {
      const randomX = (Math.random() - 0.5) * 100;
      return Animated.parallel([
        Animated.sequence([
          Animated.timing(particle.opacity, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(particle.scale, {
          toValue: 2,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateY, {
          toValue: -200,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateX, {
          toValue: randomX,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(100, animations).start();
  }, []);

  return (
    <View style={styles.smokeContainer}>
      {smokeParticles.map((particle, index) => (
        <Animated.View
          key={`smoke-${index}`}
          style={[
            styles.smokeParticle,
            {
              transform: [
                { scale: particle.scale },
                { translateY: particle.translateY },
                { translateX: particle.translateX },
              ],
              opacity: particle.opacity,
            },
          ]}
        >
          <FontAwesome name="cloud" size={30} color="#8B7355" />
        </Animated.View>
      ))}
    </View>
  );
};

const BucketAnimation = ({ isActive, text }: { isActive: boolean; text: string }) => {
  const [bucketRotation] = useState(new Animated.Value(0));
  const [letters] = useState(() => 
    text.split('').map((letter, index) => ({
      letter,
      scale: new Animated.Value(1),
      opacity: new Animated.Value(1),
      translateY: new Animated.Value(-200),
      translateX: new Animated.Value((index - text.length / 2) * 15),
      rotate: new Animated.Value(0),
    }))
  );

  useEffect(() => {
    if (isActive) {
      // Bucket tipping animation
      Animated.sequence([
        Animated.timing(bucketRotation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Letters falling animation
      const letterAnimations = letters.map((letter, index) => {
        const randomRotation = Math.random() * 360;
        return Animated.parallel([
          Animated.sequence([
            Animated.timing(letter.translateY, {
              toValue: 300,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(letter.opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(letter.translateX, {
            toValue: (Math.random() - 0.5) * 100,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(letter.rotate, {
            toValue: randomRotation,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(letter.scale, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.stagger(30, letterAnimations).start();
    }
  }, [isActive]);

  return (
    <View style={styles.bucketContainer}>
      <Animated.View
        style={[
          styles.bucket,
          {
            transform: [
              {
                rotate: bucketRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg'],
                }),
              },
            ],
          },
        ]}
      >
        <FontAwesome name="tint" size={40} color="#8B7355" />
      </Animated.View>
      {letters.map((letter, index) => (
        <Animated.Text
          key={`letter-${index}`}
          style={[
            styles.burningLetter,
            {
              transform: [
                { translateY: letter.translateY },
                { translateX: letter.translateX },
                { rotate: letter.rotate.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                })},
                { scale: letter.scale },
              ],
              opacity: letter.opacity,
            },
          ]}
        >
          {letter.letter}
        </Animated.Text>
      ))}
    </View>
  );
};

export default function BurnThoughtsScreen() {
  const [thought, setThought] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [showAshes, setShowAshes] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const playBurnSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/whoosh.mp3')
      );
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const handleBurn = async () => {
    if (!thought.trim()) return;
    
    setIsBurning(true);
    await playBurnSound();
    
    setTimeout(() => {
      setIsBurning(false);
      setShowAshes(true);
      setThought('');
      
      setTimeout(() => {
        setShowAshes(false);
      }, 2000);
    }, 1500);
  };

  return (
    <LinearGradient
      colors={['#F5E6D3', '#E6D5C7']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Burn Your Negative Thoughts</Text>
        <Text style={styles.subtitle}>
          Write down your worry, then watch it transform into ashes
        </Text>

        {!isBurning && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your negative thought here..."
              placeholderTextColor="#8B7355"
              value={thought}
              onChangeText={setThought}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={[styles.burnButton, !thought.trim() && styles.burnButtonDisabled]}
              onPress={handleBurn}
              disabled={!thought.trim()}
            >
              <LinearGradient
                colors={['#FF6B00', '#FF8C00']}
                style={styles.burnButtonGradient}
              >
                <FontAwesome name="fire" size={24} color="#FFF" />
                <Text style={styles.burnButtonText}>Burn It</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {isBurning && (
          <Fragment>
            <BucketAnimation isActive={isBurning} text={thought} />
            <FireAnimation isActive={isBurning} text={thought} />
            <SmokeAnimation />
          </Fragment>
        )}
        {showAshes && <AshesAnimation text={thought} />}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
    marginBottom: 30,
    textShadowColor: 'rgba(139, 115, 85, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    backgroundColor: '#FDF6E9',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    color: '#8B7355',
    borderWidth: 1,
    borderColor: '#E6D5C7',
    marginBottom: 20,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  burnButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  burnButtonDisabled: {
    opacity: 0.5,
  },
  burnButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  burnButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  fireContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 400,
  },
  firePit: {
    position: 'absolute',
    bottom: 0,
    width: 200,
    height: 200,
    backgroundColor: '#2C1810',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  flame: {
    position: 'absolute',
  },
  ash: {
    position: 'absolute',
    color: '#8B7355',
    fontSize: 16,
    fontWeight: 'bold',
  },
  burningLetter: {
    position: 'absolute',
    color: '#8B7355',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(139, 115, 85, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bucketContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  bucket: {
    width: 60,
    height: 60,
    backgroundColor: '#8B7355',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  smokeContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  smokeParticle: {
    position: 'absolute',
  },
}); 