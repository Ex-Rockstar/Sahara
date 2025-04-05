import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import SplashScreen from '../components/SplashScreen';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  const handleSplashComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="quick-therapy" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="emergency" />
      <Stack.Screen name="journal" />
      <Stack.Screen name="games" />
      <Stack.Screen name="home" />
      <Stack.Screen name="sound-therapy" />
      <Stack.Screen name="meditation" />
      <Stack.Screen name="pomodoro" />
      <Stack.Screen name="quick-relaxing" />
      <Stack.Screen
        name="call-settings"
        options={{
          title: 'Fake Call Settings',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
