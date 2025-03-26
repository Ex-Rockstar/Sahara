import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Difficulty {
  name: string;
  rows: number;
  cols: number;
  pairs: number;
}

const DIFFICULTIES: Difficulty[] = [
  { name: 'Easy', rows: 4, cols: 4, pairs: 8 },
  { name: 'Medium', rows: 5, cols: 6, pairs: 15 },
  { name: 'Hard', rows: 6, cols: 8, pairs: 24 },
];

const EMOJIS = [
  '🌟', '🌙', '☀️', '🌍', '🌺', '🌼', '🌻', '🌹',
  '🌊', '🌿', '🍀', '🌸', '🌱', '🌳', '🌴', '🌵',
  '🌷', '🌹', '🌺', '🌻', '🌼', '🌽', '🌾', '🌿',
];

export default function MemoryMatch() {
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES[0]);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(true);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const gameCards: Card[] = [];
    const selectedEmojis = EMOJIS.slice(0, difficulty.pairs);
    
    // Create pairs of cards
    for (let i = 0; i < difficulty.pairs; i++) {
      const emoji = selectedEmojis[i];
      gameCards.push(
        { id: i * 2, emoji, isFlipped: false, isMatched: false },
        { id: i * 2 + 1, emoji, isFlipped: false, isMatched: false }
      );
    }
    
    // Shuffle the cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setScore(0);
    setIsComplete(false);
  };

  const handleCardPress = (cardId: number) => {
    if (isLocked || 
        cards[cardId].isFlipped || 
        cards[cardId].isMatched || 
        flippedCards.length >= 2) {
      return;
    }

    const newCards = cards.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setIsLocked(true);
      checkMatch(newFlippedCards);
    }
  };

  const checkMatch = (flippedIds: number[]) => {
    const [first, second] = flippedIds;
    const isMatch = cards[first].emoji === cards[second].emoji;

    setTimeout(() => {
      if (isMatch) {
        const newCards = cards.map(card => 
          card.id === first || card.id === second
            ? { ...card, isMatched: true }
            : card
        );
        setCards(newCards);
        setFlippedCards([]);
        setIsLocked(false);
        setScore(prev => prev + 1);
        setMoves(prev => prev + 1);

        if (newCards.every(card => card.isMatched)) {
          setIsComplete(true);
        }
      } else {
        const newCards = cards.map(card => 
          card.id === first || card.id === second
            ? { ...card, isFlipped: false }
            : card
        );
        setCards(newCards);
        setFlippedCards([]);
        setIsLocked(false);
        setMoves(prev => prev + 1);
      }
    }, 1000);
  };

  const getCardWidth = () => {
    const padding = 24;
    const gap = 8;
    return (width - padding * 2 - gap * (difficulty.cols - 1)) / difficulty.cols;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.difficultyButton}
          onPress={() => setShowDifficultyModal(true)}
        >
          <Text style={styles.difficultyText}>{difficulty.name}</Text>
          <Ionicons name="settings-outline" size={20} color="#6D597A" />
        </TouchableOpacity>
        <View style={styles.stats}>
          <Text style={styles.score}>Score: {score}</Text>
          <Text style={styles.moves}>Moves: {moves}</Text>
        </View>
      </View>

      <View style={[styles.grid, { gap: 8 }]}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              { width: getCardWidth(), height: getCardWidth() },
              card.isFlipped && styles.cardFlipped,
              card.isMatched && styles.cardMatched,
            ]}
            onPress={() => handleCardPress(card.id)}
            disabled={isLocked}
          >
            <View style={styles.cardInner}>
              <Text style={styles.cardEmoji}>
                {card.isFlipped || card.isMatched ? card.emoji : '?'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={showDifficultyModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Difficulty</Text>
            {DIFFICULTIES.map((diff) => (
              <TouchableOpacity
                key={diff.name}
                style={[
                  styles.difficultyOption,
                  difficulty.name === diff.name && styles.selectedDifficulty,
                ]}
                onPress={() => {
                  setDifficulty(diff);
                  setShowDifficultyModal(false);
                  initializeGame();
                }}
              >
                <Text style={[
                  styles.difficultyOptionText,
                  difficulty.name === diff.name && styles.selectedDifficultyText,
                ]}>
                  {diff.name} ({diff.rows}x{diff.cols})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {isComplete && (
        <View style={styles.completeModal}>
          <Text style={styles.completeTitle}>Great job! Your memory is sharp today!</Text>
          <Text style={styles.completeText}>
            You completed the {difficulty.name} level in {moves} moves!
          </Text>
          <TouchableOpacity
            style={styles.playAgainButton}
            onPress={() => {
              setIsComplete(false);
              initializeGame();
            }}
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
  difficultyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  difficultyText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#6D597A',
    marginRight: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  score: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#6D597A',
  },
  moves: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#6D597A',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#E29578',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardFlipped: {
    backgroundColor: '#F4D06F',
    transform: [{ scale: 1.05 }],
  },
  cardMatched: {
    backgroundColor: '#6D597A',
  },
  cardInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#3E3E3E',
    marginBottom: 16,
    textAlign: 'center',
  },
  difficultyOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedDifficulty: {
    backgroundColor: '#E29578',
  },
  difficultyOptionText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#6D597A',
    textAlign: 'center',
  },
  selectedDifficultyText: {
    color: '#fff',
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
    textAlign: 'center',
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