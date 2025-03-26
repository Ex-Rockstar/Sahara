import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CANVAS_SIZE = width * 0.9;
const STROKE_WIDTH = 3;

interface PathData {
  d: string;
  color: string;
  strokeWidth: number;
}

const COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEEAD',
  '#D4A5A5',
  '#9B59B6',
  '#3498DB',
  '#E67E22',
  '#2ECC71',
];

const ColoringBook: React.FC = () => {
  const [paths, setPaths] = useState<PathData[]>([]);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  const handleStartDrawing = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    setIsDrawing(true);
    lastPoint.current = { x: locationX, y: locationY };
    setCurrentPath(`M ${locationX} ${locationY}`);
  };

  const handleDrawing = (event: any) => {
    if (!isDrawing) return;
    const { locationX, locationY } = event.nativeEvent;
    const newPath = `${currentPath} L ${locationX} ${locationY}`;
    setCurrentPath(newPath);
    lastPoint.current = { x: locationX, y: locationY };
  };

  const handleEndDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setPaths([...paths, { d: currentPath, color: currentColor, strokeWidth: STROKE_WIDTH }]);
    setCurrentPath('');
  };

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath('');
  };

  const undoLastPath = () => {
    setPaths(paths.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.canvasContainer}>
        <Svg
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleStartDrawing}
          onResponderMove={handleDrawing}
          onResponderRelease={handleEndDrawing}
          onResponderTerminate={handleEndDrawing}
          // onResponderTerminationRequest={handleEndDrawing}
        >
          <G>
            {paths.map((path, index) => (
              <Path
                key={index}
                d={path.d}
                stroke={path.color}
                strokeWidth={path.strokeWidth}
                fill="none"
              />
            ))}
            {currentPath ? (
              <Path
                d={currentPath}
                stroke={currentColor}
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
            ) : null}
          </G>
        </Svg>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.colorPalette}
      >
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              currentColor === color && styles.selectedColor,
            ]}
            onPress={() => setCurrentColor(color)}
          />
        ))}
      </ScrollView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={undoLastPath}>
          <Ionicons name="arrow-undo" size={24} color="#FF6B6B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={clearCanvas}>
          <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  canvasContainer: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  colorPalette: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#FF6B6B',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
});

export default ColoringBook; 