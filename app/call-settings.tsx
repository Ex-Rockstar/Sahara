import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface CallContact {
  id: string; 
  name: string;
  number: string;
  type: 'home' | 'office' | 'custom';
}

export default function CallSettingsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<CallContact[]>([]);
  const [newContact, setNewContact] = useState<CallContact>({
    id: '',
    name: '',
    number: '',
    type: 'custom',
  });

  useEffect(() => {
    loadContacts();
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

  const saveContacts = async (updatedContacts: CallContact[]) => {
    try {
      await AsyncStorage.setItem('fakeCallContacts', JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  };

  const addContact = () => {
    if (!newContact.name || !newContact.number) {
      Alert.alert('Error', 'Please fill in both name and number');
      return;
    }

    const updatedContacts = [
      ...contacts,
      {
        ...newContact,
        id: Date.now().toString(),
      },
    ];
    saveContacts(updatedContacts);
    setNewContact({ id: '', name: '', number: '', type: 'custom' });
  };
  
  const deleteContact = (id: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== id);
    saveContacts(updatedContacts);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.inputContainer}>
          <Text style={styles.title}>Add New Contact</Text>
          <TextInput
            style={styles.input}
            placeholder="Contact Name"
            value={newContact.name}
            onChangeText={(text: string) => setNewContact({ ...newContact, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={newContact.number}
            onChangeText={(text: string) => setNewContact({ ...newContact, number: text })}
            keyboardType="phone-pad"
          />
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                newContact.type === 'home' && styles.selectedType,
              ]}
              onPress={() => setNewContact({ ...newContact, type: 'home' })}
            >
              <Text style={styles.typeButtonText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                newContact.type === 'office' && styles.selectedType,
              ]}
              onPress={() => setNewContact({ ...newContact, type: 'office' })}
            >
              <Text style={styles.typeButtonText}>Office</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                newContact.type === 'custom' && styles.selectedType,
              ]}
              onPress={() => setNewContact({ ...newContact, type: 'custom' })}
            >
              <Text style={styles.typeButtonText}>Custom</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={addContact}>
            <Text style={styles.addButtonText}>Add Contact</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contactsList}>
          <Text style={styles.subtitle}>Saved Contacts</Text>
          {contacts.map((contact) => (
            <View key={contact.id} style={styles.contactItem}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
                <Text style={styles.contactType}>{contact.type}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteContact(contact.id)}
              >
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#3E3E3E',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#3E3E3E',
  },
  inputContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E29578',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  selectedType: {
    backgroundColor: '#E29578',
  },
  typeButtonText: {
    color: '#3E3E3E',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#6D597A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#3E3E3E',
  },
  contactNumber: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  contactType: {
    fontSize: 14,
    color: '#E29578',
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: 8,
  },
}); 