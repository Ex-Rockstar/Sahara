import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import ColoringBook from '../components/games/ColoringBook';
import BubbleWrapPop from '../components/games/BubbleWrapPop';
import SimpleShooter from '../components/games/SimpleShooter';
import MemoryMatch from '../components/games/MemoryMatch';
import MindPuzzle from '../components/games/MindPuzzle';
import BreathingGame from '../components/games/BreathingGame';

type GameType = 'menu' | 'coloring' | 'bubble' | 'shooter' | 'memory' | 'puzzle' | 'breathing';

const GAMES = [
  {
    id: 'coloring',
    title: 'Coloring Book',
    description: 'Express your creativity with a relaxing coloring experience',
    icon: '🎨',
    color: '#F4D06F',
    component: 'coloring',
  },
  {
    id: 'bubble',
    title: 'Bubble Wrap Pop',
    description: 'Pop virtual bubble wrap for instant stress relief',
    icon: '🫧',
    color: '#E29578',
    component: 'bubble',
  },
  {
    id: 'shooter',
    title: 'Simple Shooter',
    description: 'A fun target shooting game to distract your mind',
    icon: '🎯',
    color: '#6D597A',
    component: 'shooter',
  },
  {
    id: 'memory',
    title: 'Memory Match',
    description: 'Match pairs of calming images to improve focus',
    icon: '🎴',
    color: '#F4D06F',
    component: 'memory',
  },
  {
    id: 'puzzle',
    title: 'Mind Puzzle',
    description: 'Solve relaxing puzzles to clear your mind',
    icon: '🧩',
    color: '#E29578',
    component: 'puzzle',
  },
  {
    id: 'breathing',
    title: 'Breathing Game',
    description: 'Follow the expanding circle to practice deep breathing',
    icon: '🌬️',
    color: '#6D597A',
    component: 'breathing',
  },
];

export default function GamesScreen() {
  const [currentGame, setCurrentGame] = useState<GameType>('menu');

  const renderGame = () => {
    switch (currentGame) {
      case 'coloring':
        return <ColoringBook />;
      case 'bubble':
        return <BubbleWrapPop />;
      case 'shooter':
        return <SimpleShooter />;
      case 'memory':
        return <MemoryMatch />;
      case 'puzzle':
        return <MindPuzzle />;
      case 'breathing':
        return <BreathingGame />;
      default:
        return (
          <LinearGradient
            colors={['#F7F5F2', '#F4D06F']}
            style={styles.gradient}
          >
            <ScrollView style={styles.scrollView}>
              <View style={styles.header}>
                <Text style={styles.title}>Stress Relief Games</Text>
                <Text style={styles.subtitle}>Choose a game to play and relax</Text>
              </View>

              <View style={styles.content}>
                {GAMES.map((game) => (
                  <TouchableOpacity
                    key={game.id}
                    style={[styles.gameCard, { borderColor: game.color }]}
                    onPress={() => setCurrentGame(game.component as GameType)}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardIcon}>{game.icon}</Text>
                      <Text style={styles.cardTitle}>{game.title}</Text>
                    </View>
                    <Text style={styles.cardDescription}>{game.description}</Text>
                    <View style={styles.cardFooter}>
                      <TouchableOpacity
                        style={[styles.playButton, { backgroundColor: game.color }]}
                      >
                        <Text style={styles.playButtonText}>Play Now</Text>
                        <Ionicons name="play" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </LinearGradient>
        );
    }
  };

  return (
    <View style={styles.container}>
      {currentGame !== 'menu' && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentGame('menu')}
        >
          <Ionicons name="arrow-back" size={24} color="#3E3E3E" />
          <Text style={styles.backButtonText}>Back to Games</Text>
        </TouchableOpacity>
      )}
      {renderGame()}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80,
  },
  header: {
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    color: '#3E3E3E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Lora',
    color: '#6D597A',
  },
  content: {
    padding: 16,
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#3E3E3E',
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: 'Lora',
    color: '#6D597A',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#3E3E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '600',
    marginRight: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F4D06F',
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#3E3E3E',
    marginLeft: 8,
  },
}); 