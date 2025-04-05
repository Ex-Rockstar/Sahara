import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#F4D06F', '#E29578']}
        style={styles.header}
      >
        <Text style={styles.title}>Settings</Text>
      </LinearGradient>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push('/settings/pin')}
        >
          <View style={styles.settingContent}>
            <Ionicons name="lock-closed" size={24} color="#6D597A" />
            <Text style={styles.settingText}>Journal PIN</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#6D597A" />
        </TouchableOpacity>

        {/* Add other settings items here */}
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
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingText: {
    fontSize: 18,
    fontFamily: 'Poppins',
    color: '#3E3E3E',
  },
}); 