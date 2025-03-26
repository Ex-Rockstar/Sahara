import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PUZZLE_SIZE = 3;
const PIECE_SIZE = (width - 48) / PUZZLE_SIZE;

interface PuzzlePiece {
  id: number;
  currentPosition: number;
  correctPosition: number;
}

export default function MindPuzzle() {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const pan = React.useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    initializePuzzle();
  }, []);

  const initializePuzzle = () => {
    const puzzlePieces: PuzzlePiece[] = [];
    for (let i = 0; i < PUZZLE_SIZE * PUZZLE_SIZE; i++) {
      puzzlePieces.push({
        id: i,
        currentPosition: i,
        correctPosition: i,
      });
    }
    // Shuffle pieces
    const shuffledPieces = puzzlePieces.sort(() => Math.random() - 0.5);
    setPieces(shuffledPieces);
    setMoves(0);
    setIsComplete(false);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (_, gestureState) => {
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
      pan.setValue({ x: 0, y: 0 });
    },
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (_, gestureState) => {
      pan.flattenOffset();
      const newPosition = calculateNewPosition(gestureState);
      if (newPosition !== null && selectedPiece !== null) {
        swapPieces(selectedPiece, newPosition);
      }
      setSelectedPiece(null);
      pan.setValue({ x: 0, y: 0 });
    },
  });

  const calculateNewPosition = (gestureState: any) => {
    const { dx, dy } = gestureState;
    const threshold = PIECE_SIZE / 2;
    
    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      const direction = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
      const currentIndex = pieces.findIndex(p => p.id === selectedPiece);
      const row = Math.floor(currentIndex / PUZZLE_SIZE);
      const col = currentIndex % PUZZLE_SIZE;
      
      if (direction === 'horizontal') {
        return dx > 0 && col < PUZZLE_SIZE - 1 ? currentIndex + 1 :
               dx < 0 && col > 0 ? currentIndex - 1 : null;
      } else {
        return dy > 0 && row < PUZZLE_SIZE - 1 ? currentIndex + PUZZLE_SIZE :
               dy < 0 && row > 0 ? currentIndex - PUZZLE_SIZE : null;
      }
    }
    return null;
  };

  const swapPieces = (piece1Id: number, piece2Id: number) => {
    const newPieces = [...pieces];
    const piece1Index = newPieces.findIndex(p => p.id === piece1Id);
    const piece2Index = newPieces.findIndex(p => p.id === piece2Id);
    
    // Swap positions
    const temp = newPieces[piece1Index].currentPosition;
    newPieces[piece1Index].currentPosition = newPieces[piece2Index].currentPosition;
    newPieces[piece2Index].currentPosition = temp;
    
    setPieces(newPieces);
    setMoves(prev => prev + 1);
    
    // Check if puzzle is complete
    if (newPieces.every(piece => piece.currentPosition === piece.correctPosition)) {
      setIsComplete(true);
    }
  };

  const renderPuzzlePiece = (piece: PuzzlePiece) => {
    const isSelected = selectedPiece === piece.id;
    const animatedStyle = isSelected ? {
      transform: [
        { translateX: pan.x },
        { translateY: pan.y },
        { scale: 1.1 },
      ],
    } : {};

    return (
      <Animated.View
        key={piece.id}
        style={[
          styles.piece,
          animatedStyle,
          isSelected && styles.selectedPiece,
        ]}
        {...(isSelected ? panResponder.panHandlers : {})}
      >
        <TouchableOpacity
          style={styles.pieceContent}
          onPress={() => setSelectedPiece(piece.id)}
        >
          <Text style={styles.pieceNumber}>{piece.currentPosition + 1}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mind Puzzle</Text>
        <Text style={styles.moves}>Moves: {moves}</Text>
      </View>

      <View style={styles.puzzleContainer}>
        {pieces.map(piece => renderPuzzlePiece(piece))}
      </View>

      {isComplete && (
        <View style={styles.completeModal}>
          <Text style={styles.completeTitle}>Congratulations!</Text>
          <Text style={styles.completeText}>
            You completed the puzzle in {moves} moves!
          </Text>
          <TouchableOpacity
            style={styles.playAgainButton}
            onPress={initializePuzzle}
          >
            <Text style={styles.playAgainText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F2',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#3E3E3E',
  },
  moves: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#6D597A',
  },
  puzzleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  piece: {
    width: PIECE_SIZE,
    height: PIECE_SIZE,
    margin: 2,
    backgroundColor: '#F4D06F',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPiece: {
    backgroundColor: '#E29578',
    zIndex: 1,
  },
  pieceContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieceNumber: {
    fontSize: 24,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#3E3E3E',
  },
  completeModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -100 }],
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    width: 300,
  },
  completeTitle: {
    fontSize: 24,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#3E3E3E',
    marginBottom: 8,
  },
  completeText: {
    fontSize: 16,
    fontFamily: 'Lora',
    color: '#6D597A',
    textAlign: 'center',
    marginBottom: 24,
  },
  playAgainButton: {
    backgroundColor: '#E29578',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  playAgainText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
}); 