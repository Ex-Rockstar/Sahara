import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

interface FakeCallProps {
  onClose: () => void;
  callerName: string;
  callerNumber: string;
}

const FakeCall: React.FC<FakeCallProps> = ({ onClose, callerName, callerNumber }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start playing ringtone immediately when component mounts
    playCallSound();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    return () => {
      // Cleanup sound when component unmounts
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCallActive]);

  const playCallSound = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/ringtone.mp3'),
        { shouldPlay: true, isLooping: true }
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error playing call sound:', error);
    }
  };

  const stopCallSound = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
    } catch (error) {
      console.error('Error stopping call sound:', error);
    }
  };

  const handleAnswer = async () => {
    setIsCallActive(true);
    await stopCallSound(); // Stop ringtone when call is answered
  };

  const handleEndCall = async () => {
    setIsCallActive(false);
    setCallDuration(0);
    await stopCallSound(); // Stop ringtone when call is ended
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      transparent
      visible={true}
      animationType="fade"
      onRequestClose={handleEndCall}
    >
      <StatusBar barStyle="light-content" />
      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.callerName}>{callerName}</Text>
            <Text style={styles.phoneNumber}>{callerNumber}</Text>
            {isCallActive && (
              <Text style={styles.timer}>{formatTime(callDuration)}</Text>
            )}
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.button, styles.endButton]}
              onPress={handleEndCall}
            >
              <Ionicons name="call" size={30} color="#fff" />
            </TouchableOpacity>
            {!isCallActive && (
              <TouchableOpacity
                style={[styles.button, styles.answerButton]}
                onPress={handleAnswer}
              >
                <Ionicons name="call" size={30} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  callerName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  phoneNumber: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 20,
  },
  timer: {
    fontSize: 24,
    color: '#4CAF50',
    marginTop: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    paddingHorizontal: 20,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerButton: {
    backgroundColor: '#4CAF50',
  },
  endButton: {
    backgroundColor: '#F44336',
  },
});

export default FakeCall; 