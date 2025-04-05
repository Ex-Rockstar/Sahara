declare module 'react-native-calendars' {
  export const Calendar: React.ComponentType<{
    markedDates?: Record<string, any>;
    markingType?: string;
    theme?: {
      textDayFontSize?: number;
      textMonthFontSize?: number;
      textDayHeaderFontSize?: number;
      selectedDayBackgroundColor?: string;
      selectedDayTextColor?: string;
      todayTextColor?: string;
      dayTextColor?: string;
      textDisabledColor?: string;
      dotColor?: string;
      monthTextColor?: string;
    };
  }>;
} 