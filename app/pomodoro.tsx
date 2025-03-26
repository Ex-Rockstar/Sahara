import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import PomodoroTimer from '../components/PomodoroTimer';
import BottomNavBar from '../components/BottomNavBar';

export default function PomodoroScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <PomodoroTimer />
      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 