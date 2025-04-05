declare module 'expo-router' {
  export function useRouter(): {
    push: (route: string) => void;
  };
  export const Stack: any;
}

declare module 'expo-linear-gradient' {
  import { ViewProps } from 'react-native';
  export class LinearGradient extends React.Component<ViewProps & {
    colors: string[];
  }> {}
}

declare module '@expo/vector-icons' {
  import { Component } from 'react';
  export class Ionicons extends Component<{
    name: string;
    size: number;
    color: string;
  }> {}
}

declare module 'react-native-calendars' {
  import { Component } from 'react';
  export class Calendar extends Component<{
    markedDates: any;
    markingType: string;
    theme: any;
  }> {}
} 