import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/home')}
      >
        <Ionicons
          name={isActive('/home') ? 'home' : 'home-outline'}
          size={24}
          color={isActive('/home') ? '#4A90E2' : '#666'}
        />
        <Text
          style={[
            styles.navText,
            isActive('/home') && styles.activeText,
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/journal')}
      >
        <Ionicons
          name={isActive('/journal') ? 'journal' : 'journal-outline'}
          size={24}
          color={isActive('/journal') ? '#4A90E2' : '#666'}
        />
        <Text
          style={[
            styles.navText,
            isActive('/journal') && styles.activeText,
          ]}
        >
          Journal
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/quick-therapy')}
      >
        <Ionicons
          name={isActive('/quick-therapy') ? 'heart' : 'heart-outline'}
          size={24}
          color={isActive('/quick-therapy') ? '#4A90E2' : '#666'}
        />
        <Text
          style={[
            styles.navText,
            isActive('/quick-therapy') && styles.activeText,
          ]}
        >
          Quick Therapy
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/chat')}
      >
        <Ionicons
          name={isActive('/chat') ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
          size={24}
          color={isActive('/chat') ? '#4A90E2' : '#666'}
        />
        <Text
          style={[
            styles.navText,
            isActive('/chat') && styles.activeText,
          ]}
        >
          AI Chat
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/games')}
      >
        <Ionicons
          name={isActive('/games') ? 'game-controller' : 'game-controller-outline'}
          size={24}
          color={isActive('/games') ? '#4A90E2' : '#666'}
        />
        <Text
          style={[
            styles.navText,
            isActive('/games') && styles.activeText,
          ]}
        >
          Games
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/emergency')}
      >
        <Ionicons
          name={isActive('/emergency') ? 'warning' : 'warning-outline'}
          size={24}
          color={isActive('/emergency') ? '#FF6B6B' : '#666'}
        />
        <Text
          style={[
            styles.navText,
            isActive('/emergency') && styles.emergencyText,
          ]}
        >
          Emergency
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    height: 60,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
    fontFamily: 'Poppins',
  },
  activeText: {
    color: '#4A90E2',
  },
  emergencyText: {
    color: '#FF6B6B',
  },
}); 