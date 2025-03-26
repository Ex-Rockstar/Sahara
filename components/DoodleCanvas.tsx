import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface DoodleCanvasProps {
  onSave: (uri: string) => void;
  onClose: () => void;
}

export default function DoodleCanvas({ onSave, onClose }: DoodleCanvasProps) {
  const [paths, setPaths] = useState<Array<{ points: Array<{ x: number; y: number }>; color: string }>>([]);
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([]);
  const [currentColor, setCurrentColor] = useState('#6D597A');
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (_, gestureState) => {
      const newPoint = {
        x: gestureState.x0,
        y: gestureState.y0,
      };
      setCurrentPath([newPoint]);
    },
    onPanResponderMove: (_, gestureState) => {
      const newPoint = {
        x: gestureState.moveX,
        y: gestureState.moveY,
      };
      setCurrentPath(prev => [...prev, newPoint]);
    },
    onPanResponderRelease: () => {
      if (currentPath.length > 0) {
        setPaths(prev => [...prev, { points: currentPath, color: isEraser ? '#F7F5F2' : currentColor }]);
        setCurrentPath([]);
      }
    },
  });

  const colors = ['#6D597A', '#E29578', '#F4D06F', '#3E3E3E', '#F7F5F2'];
  const brushSizes = [2, 5, 10, 15, 20];

  const handleClear = () => {
    setPaths([]);
    setCurrentPath([]);
  };

  const handleUndo = () => {
    setPaths(prev => prev.slice(0, -1));
    setCurrentPath([]);
  };

  const handleSave = () => {
    // In a real app, you would convert the paths to an image
    // For now, we'll just pass a dummy URI
    onSave('doodle://' + Date.now());
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolButton} onPress={handleClear}>
          <Ionicons name="trash-outline" size={24} color="#6D597A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton} onPress={handleUndo}>
          <Ionicons name="arrow-undo-outline" size={24} color="#6D597A" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolButton, isEraser && styles.toolButtonActive]}
          onPress={() => setIsEraser(!isEraser)}
        >
          <Ionicons name="backspace-outline" size={24} color={isEraser ? '#fff' : '#6D597A'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        {paths.map((path, index) => (
          <View key={index} style={styles.pathContainer}>
            {path.points.map((point, pointIndex) => (
              <View
                key={pointIndex}
                style={[
                  styles.point,
                  {
                    left: point.x,
                    top: point.y,
                    backgroundColor: path.color,
                    width: brushSize,
                    height: brushSize,
                    borderRadius: brushSize / 2,
                  },
                ]}
              />
            ))}
          </View>
        ))}
        {currentPath.map((point, index) => (
          <View
            key={index}
            style={[
              styles.point,
              {
                left: point.x,
                top: point.y,
                backgroundColor: isEraser ? '#F7F5F2' : currentColor,
                width: brushSize,
                height: brushSize,
                borderRadius: brushSize / 2,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.colorPicker}>
        {colors.map(color => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              currentColor === color && styles.colorButtonActive,
            ]}
            onPress={() => {
              setCurrentColor(color);
              setIsEraser(false);
            }}
          />
        ))}
      </View>

      <View style={styles.brushSizePicker}>
        {brushSizes.map(size => (
          <TouchableOpacity
            key={size}
            style={[
              styles.brushSizeButton,
              { width: size, height: size, borderRadius: size / 2 },
              brushSize === size && styles.brushSizeButtonActive,
            ]}
            onPress={() => setBrushSize(size)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E29578',
  },
  toolButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolButtonActive: {
    backgroundColor: '#E29578',
  },
  saveButton: {
    backgroundColor: '#E29578',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  pathContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  point: {
    position: 'absolute',
    backgroundColor: '#6D597A',
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E29578',
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: '#F7F5F2',
  },
  colorButtonActive: {
    borderColor: '#E29578',
  },
  brushSizePicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  brushSizeButton: {
    backgroundColor: '#6D597A',
    marginHorizontal: 8,
  },
  brushSizeButtonActive: {
    backgroundColor: '#E29578',
  },
}); 