import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

interface DrawingCanvasProps {
  onSave: (uri: string) => void;
  onClose: () => void;
}

interface PathData {
  path: string;
  color: string;
  strokeWidth: number;
}

const COLORS = ['#000000', '#FF0000', '#0000FF', '#00FF00', '#FFA500'];
const STROKE_WIDTHS = [2, 4, 6, 8, 10];

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSave, onClose }) => {
  const [paths, setPaths] = useState<PathData[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState(STROKE_WIDTHS[1]);
  const svgRef = useRef<any>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      setCurrentPath(`M ${locationX} ${locationY}`);
    },
    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      setCurrentPath(prevPath => `${prevPath} L ${locationX} ${locationY}`);
    },
    onPanResponderRelease: () => {
      if (currentPath) {
        setPaths(prevPaths => [
          ...prevPaths,
          {
            path: currentPath,
            color: selectedColor,
            strokeWidth: selectedStrokeWidth,
          },
        ]);
        setCurrentPath('');
      }
    },
  });

  const handleUndo = () => {
    setPaths(prevPaths => prevPaths.slice(0, -1));
  };

  const handleClear = () => {
    setPaths([]);
  };

  const handleSave = async () => {
    if (svgRef.current) {
      // Implementation for saving will be added
      onSave('drawing-uri');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Drawing</Text>
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Ionicons name="checkmark" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <Svg ref={svgRef} width="100%" height="100%">
          <G>
            {paths.map((pathData, index) => (
              <Path
                key={index}
                d={pathData.path}
                stroke={pathData.color}
                strokeWidth={pathData.strokeWidth}
                fill="none"
              />
            ))}
            {currentPath ? (
              <Path
                d={currentPath}
                stroke={selectedColor}
                strokeWidth={selectedStrokeWidth}
                fill="none"
              />
            ) : null}
          </G>
        </Svg>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.colorPicker}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColor,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>

        <View style={styles.strokeWidthPicker}>
          {STROKE_WIDTHS.map((width) => (
            <TouchableOpacity
              key={width}
              style={[
                styles.strokeButton,
                selectedStrokeWidth === width && styles.selectedStroke,
              ]}
              onPress={() => setSelectedStrokeWidth(width)}
            >
              <View
                style={[styles.strokePreview, { height: width, width: width * 3 }]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={handleUndo} style={styles.actionButton}>
            <Ionicons name="arrow-undo" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClear} style={styles.actionButton}>
            <Ionicons name="trash" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  toolbar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#333',
  },
  strokeWidthPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  strokeButton: {
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedStroke: {
    backgroundColor: '#f0f0f0',
    borderColor: '#333',
  },
  strokePreview: {
    backgroundColor: '#333',
    borderRadius: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
}); 