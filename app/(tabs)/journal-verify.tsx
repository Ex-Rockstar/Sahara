import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getPin } from '../../utils/pinStorage';

export default function JournalVerifyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [pin, setPin] = useState('');

  useEffect(() => {
    checkPin();
  }, []);

  const checkPin = async () => {
    const savedPin = await getPin();
    if (!savedPin) {
      // If no PIN is set, redirect to journal
      router.replace('/journal');
    }
  };

  const handleVerifyPin = async () => {
    const savedPin = await getPin();
    if (pin === savedPin) {
      router.replace('/journal');
    } else {
      Alert.alert('Error', 'Incorrect PIN');
      setPin('');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#F4D06F', '#E29578']}
        style={styles.header}
      >
        <Text style={styles.title}>Enter PIN</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.description}>
          Please enter your PIN to access the journal
        </Text>

        <TextInput
          style={styles.input}
          value={pin}
          onChangeText={setPin}
          keyboardType="numeric"
          maxLength={4}
          secureTextEntry
          placeholder="Enter PIN"
          onSubmitEditing={handleVerifyPin}
        />

        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerifyPin}
        >
          <Text style={styles.verifyButtonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 18,
    fontFamily: 'Poppins',
    color: '#6D597A',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontFamily: 'Poppins',
    color: '#3E3E3E',
    width: '80%',
    textAlign: 'center',
    letterSpacing: 8,
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: '#E29578',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
}); 