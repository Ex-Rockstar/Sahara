import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

interface AudioPlayerProps {
  uri: string;
  onDelete?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ uri, onDelete }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const animation = new Animated.Value(0);

  useEffect(() => {
    loadAudio();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [uri]);

  const loadAudio = async () => {
    try {
      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(audioSound);
      const status = await audioSound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        stopAnimation();
      }
    }
  };

  const startAnimation = () => {
    animation.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopAnimation = () => {
    animation.stopAnimation();
    animation.setValue(0);
  };

  const togglePlayback = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
      stopAnimation();
    } else {
      await sound.playFromPositionAsync(position);
      startAnimation();
    }
  };

  const onSliderValueChange = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  const bars = Array(20).fill(0);
  const barStyle = (index: number) => ({
    transform: [
      {
        scaleY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 0.6 + Math.random() * 0.4],
        }),
      },
    ],
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading audio...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.visualizer}>
        {bars.map((_, index) => (
          <Animated.View
            key={index}
            style={[styles.bar, barStyle(index)]}
          />
        ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color="#333"
          />
        </TouchableOpacity>

        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            onSlidingComplete={onSliderValueChange}
            minimumTrackTintColor="#FF6B6B"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#FF6B6B"
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  visualizer: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bar: {
    width: 3,
    height: 20,
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  slider: {
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
}); 