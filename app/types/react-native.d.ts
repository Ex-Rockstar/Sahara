declare module 'react-native' {
  export const View: any;
  export const Text: any;
  export const StyleSheet: any;
  export const TouchableOpacity: any;
  export const TextInput: React.ComponentType<{
    style?: any;
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    keyboardType?: string;
  }>;
  export const ScrollView: any;
  export const Modal: any;
  export const Animated: any;
  export const Dimensions: any;
  export const Alert: {
    alert: (title: string, message?: string, buttons?: Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }>) => void;
  };
  export const SafeAreaView: React.ComponentType<any>;
  export const Linking: {
    openURL: (url: string) => Promise<void>;
  };
} 