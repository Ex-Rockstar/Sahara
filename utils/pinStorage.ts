import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_KEY = 'journal_pin';

export const savePin = async (pin: string) => {
  try {
    await AsyncStorage.setItem(PIN_KEY, pin);
    return true;
  } catch (error) {
    console.error('Error saving PIN:', error);
    return false;
  }
};

export const getPin = async () => {
  try {
    const pin = await AsyncStorage.getItem(PIN_KEY);
    return pin;
  } catch (error) {
    console.error('Error getting PIN:', error);
    return null;
  }
};

export const hasPin = async () => {
  const pin = await getPin();
  return pin !== null;
}; 