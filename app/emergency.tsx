import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import * as SecureStore from 'expo-secure-store';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

const EmergencyScreen = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const savedContacts = await SecureStore.getItemAsync('emergency_contacts');
      if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const saveContacts = async (updatedContacts: EmergencyContact[]) => {
    try {
      await SecureStore.setItemAsync('emergency_contacts', JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContact.name,
      phone: newContact.phone,
      relationship: newContact.relationship,
    };

    const updatedContacts = [...contacts, contact];
    saveContacts(updatedContacts);
    setNewContact({ name: '', phone: '', relationship: '' });
    setShowAddForm(false);
  };

  const handleDeleteContact = (id: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedContacts = contacts.filter(contact => contact.id !== id);
            saveContacts(updatedContacts);
          },
        },
      ]
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleText = (number: string) => {
    Linking.openURL(`sms:${number}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Ionicons name="warning" size={32} color="#FF3B30" />
          <Text style={styles.headerTitle}>Emergency Help</Text>
          <Text style={styles.headerSubtitle}>Immediate support when you need it</Text>
        </View>

        <View style={styles.emergencySection}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddForm(true)}
          >
            <Ionicons name="add-circle" size={24} color="#FF6B6B" />
          </TouchableOpacity>
          {showAddForm && (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={newContact.name}
                onChangeText={(text) => setNewContact({ ...newContact, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={newContact.phone}
                onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Relationship (optional)"
                value={newContact.relationship}
                onChangeText={(text) => setNewContact({ ...newContact, relationship: text })}
              />
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowAddForm(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleAddContact}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <ScrollView style={styles.contactsList}>
            {contacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                  {contact.relationship && (
                    <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                  )}
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleCall(contact.phone)}
                  >
                    <Ionicons name="call" size={24} color="#FF6B6B" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteContact(contact.id)}
                  >
                    <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.safetySection}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          <View style={styles.safetyCard}>
            <Text style={styles.safetyTip}>
              • Stay calm and take deep breaths{'\n'}
              • Find a safe, quiet place{'\n'}
              • Reach out to someone you trust{'\n'}
              • Remember that help is always available{'\n'}
              • You are not alone
            </Text>
          </View>
        </View>

        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          <TouchableOpacity style={styles.resourceCard}>
            <Ionicons name="book" size={24} color="#007AFF" />
            <Text style={styles.resourceText}>Coping Strategies Guide</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resourceCard}>
            <Ionicons name="people" size={24} color="#007AFF" />
            <Text style={styles.resourceText}>Find Support Groups</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  emergencySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  addButton: {
    padding: 8,
  },
  form: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E29578',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#E29578',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  contactsList: {
    flex: 1,
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6D597A',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 16,
    color: '#E29578',
    marginBottom: 4,
  },
  contactRelationship: {
    fontSize: 14,
    color: '#666',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  safetySection: {
    marginBottom: 24,
  },
  safetyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  safetyTip: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  resourcesSection: {
    marginBottom: 24,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});

export default EmergencyScreen; 