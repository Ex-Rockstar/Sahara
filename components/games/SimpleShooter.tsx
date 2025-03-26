import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Animated,
  PanResponder,
} from 'react-native';
import { Audio } from 'expo-av';
import Svg, { Circle, Line } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const PLAYER_SIZE = 40;
const TARGET_SIZE = 30;
const BULLET_SIZE = 8;
const GAME_DURATION = 30; // seconds

interface Target {
  id: number;
  x: number;
  y: number;
  isHit: boolean;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

const SimpleShooter: React.FC = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [targets, setTargets] = useState<Target[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const playerPosition = useRef(new Animated.ValueXY({ x: width / 2, y: height - 100 })).current;
  const currentPlayerPos = useRef({ x: width / 2, y: height - 100 });

  useEffect(() => {
    initializeGame();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const initializeGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsGameOver(false);
    generateTargets();
    startTimer();
  };

  const generateTargets = () => {
    const newTargets: Target[] = Array.from({ length: 5 }, (_, index) => ({
      id: index,
      x: Math.random() * (width - TARGET_SIZE),
      y: Math.random() * (height / 3),
      isHit: false,
    }));
    setTargets(newTargets);
  };

  const startTimer = () => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const playShootSound = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/rain.mp3'),
        { 
          shouldPlay: true, 
          volume: 0.1,
          rate: 2.0
        }
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error playing shoot sound:', error);
      // Silently fail if sound cannot be played
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newX = Math.max(PLAYER_SIZE / 2, Math.min(width - PLAYER_SIZE / 2, gestureState.moveX));
        currentPlayerPos.current = { x: newX, y: height - 100 };
        playerPosition.setValue({ x: newX, y: height - 100 });
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const shoot = (target: Target) => {
    if (isGameOver) return;
    
    const newBullet: Bullet = {
      id: Date.now(),
      x: currentPlayerPos.current.x,
      y: currentPlayerPos.current.y,
      targetX: target.x + TARGET_SIZE / 2,
      targetY: target.y + TARGET_SIZE / 2,
    };

    setBullets((prev) => [...prev, newBullet]);
    playShootSound();

    // Simulate bullet travel
    setTimeout(() => {
      setBullets((prev) => prev.filter((b) => b.id !== newBullet.id));
      setTargets((prev) =>
        prev.map((t) =>
          t.id === target.id ? { ...t, isHit: true } : t
        )
      );
      setScore((prev) => prev + 10);
    }, 500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.timer}>Time: {timeLeft}s</Text>
      </View>

      <Animated.View
        style={[
          styles.player,
          {
            transform: [
              { translateX: playerPosition.x },
              { translateY: playerPosition.y },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Svg width={PLAYER_SIZE} height={PLAYER_SIZE}>
          <Circle
            cx={PLAYER_SIZE / 2}
            cy={PLAYER_SIZE / 2}
            r={PLAYER_SIZE / 2}
            fill="#4ECDC4"
            stroke="#45B7D1"
            strokeWidth="2"
          />
        </Svg>
      </Animated.View>

      {targets.map((target) => (
        <TouchableOpacity
          key={target.id}
          style={[
            styles.target,
            {
              left: target.x,
              top: target.y,
              opacity: target.isHit ? 0 : 1,
            },
          ]}
          onPress={() => shoot(target)}
          disabled={target.isHit}
        >
          <Svg width={TARGET_SIZE} height={TARGET_SIZE}>
            <Circle
              cx={TARGET_SIZE / 2}
              cy={TARGET_SIZE / 2}
              r={TARGET_SIZE / 2}
              fill="#FF6B6B"
              stroke="#FF8787"
              strokeWidth="2"
            />
          </Svg>
        </TouchableOpacity>
      ))}

      {bullets.map((bullet) => (
        <Svg
          key={bullet.id}
          style={StyleSheet.absoluteFill}
          width={width}
          height={height}
        >
          <Line
            x1={bullet.x}
            y1={bullet.y}
            x2={bullet.targetX}
            y2={bullet.targetY}
            stroke="#FFD93D"
            strokeWidth={BULLET_SIZE}
          />
        </Svg>
      ))}

      {isGameOver && (
        <View style={styles.gameOver}>
          <Text style={styles.gameOverText}>Game Over!</Text>
          <Text style={styles.finalScore}>Final Score: {score}</Text>
          <TouchableOpacity style={styles.restartButton} onPress={initializeGame}>
            <Text style={styles.restartButtonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  timer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    zIndex: 1,
  },
  target: {
    position: 'absolute',
    width: TARGET_SIZE,
    height: TARGET_SIZE,
  },
  gameOver: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  finalScore: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 30,
  },
  restartButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  restartButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default SimpleShooter; 