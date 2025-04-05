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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface CallContact {
  id: string;
  name: string;
  number: string;
  type: 'home' | 'office';
}

interface FakeCallProps {
  onClose: () => void;
}

const FakeCall: React.FC<FakeCallProps> = ({ onClose }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [contacts, setContacts] = useState<CallContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<CallContact | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadContacts();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadContacts = async () => {
    try {
      const savedContacts = await AsyncStorage.getItem('fakeCallContacts');
      if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

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

  const handleContactSelect = (contact: CallContact) => {
    setSelectedContact(contact);
    playCallSound();
  };

  const handleAnswer = async () => {
    setIsCallActive(true);
    await stopCallSound();
  };

  const handleEndCall = async () => {
    setIsCallActive(false);
    setCallDuration(0);
    setSelectedContact(null);
    await stopCallSound();
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
        {!selectedContact ? (
          <ScrollView style={styles.contactsContainer}>
            <Text style={styles.title}>Select a Contact</Text>
            {contacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactButton}
                onPress={() => handleContactSelect(contact)}
              >
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactNumber}>{contact.number}</Text>
                  <Text style={styles.contactType}>{contact.type}</Text>
                </View>
                <Ionicons name="call" size={24} color="#4CAF50" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.callScreen}>
            <View style={styles.header}>
              <Text style={styles.callerName}>{selectedContact.name}</Text>
              <Text style={styles.phoneNumber}>{selectedContact.number}</Text>
              {isCallActive && (
                <Text style={styles.timer}>{formatTime(callDuration)}</Text>
              )}
            </View>

            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.button, styles.endButton]}
                onPress={handleEndCall}
              >
                <Ionicons name="call-outline" size={30} color="#fff" />
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
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  contactsContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  contactNumber: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 3,
  },
  contactType: {
    fontSize: 12,
    color: '#4CAF50',
  },
  callScreen: {
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