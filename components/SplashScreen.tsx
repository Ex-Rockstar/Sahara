import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const particles = useRef(
    Array(5).fill(0).map(() => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(Math.random() * height),
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Logo fade in
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Ripple effect
    Animated.timing(rippleScale, {
      toValue: 1.5,
      duration: 1500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Glow effect
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    glowAnimation.start();

    // Tagline fade in
    Animated.timing(taglineOpacity, {
      toValue: 1,
      duration: 1000,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // Floating particles
    particles.forEach((particle, index) => {
      const particleAnimation = Animated.sequence([
        Animated.timing(particle.scale, {
          toValue: 1,
          duration: 1000,
          delay: index * 200,
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: 1,
          duration: 1000,
          delay: index * 200,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.y, {
              toValue: -50,
              duration: 3000,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(particle.y, {
              toValue: height + 50,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(particle.x, {
              toValue: Math.random() * width,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ),
      ]);
      particleAnimation.start();
    });

    // Transition to home screen
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete();
      });
    }, 2500);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#C8A2C8', '#F5DEB3']}
        style={styles.gradient}
      >
        {/* Floating particles */}
        {particles.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                  { scale: particle.scale },
                ],
                opacity: particle.opacity,
              },
            ]}
          >
            <Image
              source={require('../assets/images/star.png')}
              style={styles.particleImage}
            />
          </Animated.View>
        ))}

        {/* Logo container with glow effect */}
        <View style={styles.logoContainer}>
          <Animated.View
            style={[
              styles.glow,
              {
                opacity: glowOpacity,
                transform: [{ scale: rippleScale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: logoOpacity,
              },
            ]}
          >
            <Image
              source={require('../assets/images/star.png')}
              style={styles.logo}
            />
          </Animated.View>
        </View>

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: taglineOpacity,
            },
          ]}
        >
          A companion in every storm
        </Animated.Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFF',
    opacity: 0.3,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
  tagline: {
    marginTop: 20,
    fontSize: 18,
    fontFamily: 'Poppins',
    color: '#FFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  particle: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particleImage: {
    width: 20,
    height: 20,
    opacity: 0.6,
  },
}); 