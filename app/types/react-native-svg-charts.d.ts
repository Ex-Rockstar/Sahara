declare module 'react-native-svg-charts' {
  import { ViewStyle } from 'react-native';

  interface ChartProps {
    style?: ViewStyle;
    data: number[];
    contentInset?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
    curve?: any;
    svg?: {
      stroke?: string;
      strokeWidth?: number;
      fill?: string;
    };
  }

  export class LineChart extends React.Component<ChartProps> {}
} 