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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { savePin, getPin } from '../../utils/pinStorage';

export default function PinSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [hasExistingPin, setHasExistingPin] = useState(false);

  useEffect(() => {
    checkExistingPin();
  }, []);

  const checkExistingPin = async () => {
    const pin = await getPin();
    setHasExistingPin(pin !== null);
  };

  const handleSavePin = async () => {
    if (hasExistingPin) {
      const existingPin = await getPin();
      if (currentPin !== existingPin) {
        Alert.alert('Error', 'Current PIN is incorrect');
        return;
      }
    }

    if (newPin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }

    const success = await savePin(newPin);
    if (success) {
      Alert.alert('Success', 'PIN has been saved', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('Error', 'Failed to save PIN');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#F4D06F', '#E29578']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Journal PIN</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {hasExistingPin && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current PIN</Text>
            <TextInput
              style={styles.input}
              value={currentPin}
              onChangeText={setCurrentPin}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              placeholder="Enter current PIN"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>New PIN</Text>
          <TextInput
            style={styles.input}
            value={newPin}
            onChangeText={setNewPin}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            placeholder="Enter new PIN"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm PIN</Text>
          <TextInput
            style={styles.input}
            value={confirmPin}
            onChangeText={setConfirmPin}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            placeholder="Confirm new PIN"
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSavePin}
        >
          <Text style={styles.saveButtonText}>Save PIN</Text>
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
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#6D597A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontFamily: 'Poppins',
    color: '#3E3E3E',
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: '#E29578',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
}); 