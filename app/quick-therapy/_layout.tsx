import { Stack } from 'expo-router';

export default function QuickTherapyLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2C1810',
        },
        headerTintColor: '#FFA500',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Quick Therapy',
        }}
      />
      <Stack.Screen
        name="meditation"
        options={{
          title: 'Guided Meditation',
        }}
      />
      <Stack.Screen
        name="affirmations"
        options={{
          title: 'Self Affirmations',
        }}
      />
      <Stack.Screen
        name="breathing"
        options={{
          title: 'Breathing Exercises',
        }}
      />
      <Stack.Screen
        name="chat"
        options={{
          title: 'Chat',
        }}
      />
      <Stack.Screen
        name="burn-thoughts"
        options={{
          title: 'Burn Thoughts',
        }}
      />
      <Stack.Screen
        name="sand-drawing"
        options={{
          title: 'Sand Drawing',
        }}
      />
    </Stack>
  );
} 