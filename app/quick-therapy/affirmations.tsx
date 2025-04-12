import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface Affirmation {
  id: string;
  title: string;
  affirmations: string[];
}

const affirmations: Affirmation[] = [
  {
    id: 'lost',
    title: 'Read if you feel lost',
    affirmations: [
      'You are exactly where you need to be right now',
      'Every step forward is progress, no matter how small',
      'Your journey is unique and beautiful',
      'You have the strength to find your way',
      'Trust in your inner compass',
    ],
  },
  {
    id: 'missing',
    title: 'Read if you miss someone',
    affirmations: [
      'Your love is a beautiful gift',
      'Distance cannot diminish the bonds of love',
      'Your heart has infinite capacity for love',
      'Missing someone means you have something special to miss',
      'Love transcends time and space',
    ],
  },
  {
    id: 'nostalgic',
    title: 'Read if you\'re feeling nostalgic',
    affirmations: [
      'Your memories are treasures to cherish',
      'The past has shaped you into who you are today',
      'Beautiful moments await in your future',
      'Your story is still being written',
      'Every moment is a gift to be present in',
    ],
  },
  {
    id: 'tired',
    title: 'Read if you\'re tired but can\'t rest',
    affirmations: [
      'Your body deserves rest and care',
      'It\'s okay to take a break',
      'Your worth is not measured by productivity',
      'Rest is a form of self-love',
      'You are allowed to slow down',
    ],
  },
  {
    id: 'proud',
    title: 'Read if you\'re proud of yourself',
    affirmations: [
      'Your achievements are valid and meaningful',
      'You deserve to celebrate your wins',
      'Your hard work is paying off',
      'You are making a difference',
      'Your growth is inspiring',
    ],
  },
  {
    id: 'giving-up',
    title: 'Read if you feel like giving up',
    affirmations: [
      'You are stronger than you know',
      'Every challenge makes you stronger',
      'Your resilience is remarkable',
      'You have overcome every obstacle so far',
      'This too shall pass',
    ],
  },
  {
    id: 'worth',
    title: 'Read if you need a reminder of your worth',
    affirmations: [
      'You are inherently valuable',
      'Your worth is not conditional',
      'You deserve love and respect',
      'You are enough, exactly as you are',
      'Your presence makes a difference',
    ],
  },
  {
    id: 'love',
    title: 'Read if you\'re in love',
    affirmations: [
      'Your love is beautiful and valid',
      'You deserve to be loved deeply',
      'Your heart is open and courageous',
      'Love makes you stronger',
      'Your capacity for love is infinite',
    ],
  },
  {
    id: 'start-over',
    title: 'Read if you want to start over',
    affirmations: [
      'Every day is a new beginning',
      'You have the power to create change',
      'Your past does not define your future',
      'You can always choose a different path',
      'Starting over is an act of courage',
    ],
  },
  {
    id: 'lonely',
    title: 'Read if you feel lonely in a crowded room',
    affirmations: [
      'Your feelings are valid',
      'You are not alone in feeling alone',
      'Your presence matters',
      'You are worthy of connection',
      'This feeling is temporary',
    ],
  },
  {
    id: 'comfort',
    title: 'Read if you need comfort',
    affirmations: [
      'You are safe and supported',
      'It\'s okay to need comfort',
      'You deserve to feel at ease',
      'Your feelings are valid',
      'You are cared for',
    ],
  },
  {
    id: 'misunderstood',
    title: 'Read if you feel like no one understands you',
    affirmations: [
      'Your perspective is unique and valuable',
      'You are not alone in feeling this way',
      'Your experiences shape who you are',
      'You have the strength to express yourself',
      'Your truth is valid',
    ],
  },
  {
    id: 'overwhelmed',
    title: '📜 Read if today felt like too much',
    affirmations: [
      'Take a deep breath. Slowly. Inhale for four seconds—hold—exhale.',
      'I know today felt like a weight pressing down on your chest. Maybe things didn\'t go as planned, or maybe everything just built up until it all felt unbearable. But listen to me—you made it through. That means something.',
      'You don\'t have to carry the weight of today forever. You are allowed to set it down. You don\'t have to solve everything right now. You don\'t have to be okay immediately. Just be here, in this moment, breathing. That\'s enough for now.',
      'And tomorrow? That\'s a bridge you\'ll cross when you get there. But for now, rest. Let your body be light. Let your mind be quiet. You are doing the best you can, and that is always enough.',
    ],
  },
  {
    id: 'waiting',
    title: '🌱 Read if you\'re waiting for something good',
    affirmations: [
      'Waiting is hard. It\'s heavy. It makes you feel like you\'re standing still while the world moves forward without you. But waiting is not wasted time. Growth happens in the in-between spaces.',
      'The things meant for you are still on their way. Just because you can\'t see the road ahead doesn\'t mean there isn\'t one. Good things have a way of sneaking up on you when you least expect them.',
      'So hold on, just a little longer. There are moments ahead that will make you grateful you kept going.',
      'And when they come? You\'ll see that all the waiting was worth it.',
    ],
  },
  {
    id: 'healing',
    title: '💔 Read if you\'re healing but it still hurts',
    affirmations: [
      'Healing isn\'t an instant process. It\'s not a switch you flip or a wound that disappears overnight. It\'s messy. Some days, it feels like progress. Other days, it feels like breaking all over again. And that\'s okay.',
      'You\'re not weak for still feeling the sting of what hurt you. It means you cared, you felt deeply, you lived through something that mattered. But pain doesn\'t define you—it is simply a place you have been, not where you are destined to stay.',
      'Even if you can\'t see it, you are healing. Slowly. Quietly. In the way the sun rises without permission, in the way the seasons change without force. You are becoming whole again, even in the moments when you still feel broken.',
    ],
  },
  {
    id: 'falling-behind',
    title: '⏳ Read if you feel like you\'re falling behind',
    affirmations: [
      'It\'s easy to compare. It\'s easy to feel like everyone else is ahead—achieving, thriving, figuring things out—while you\'re stuck, lost, unsure. But life isn\'t a race. It isn\'t about speed.',
      'The truth is, no one has it all figured out. We\'re all just moving at our own pace, on paths that were never meant to be identical. You are not behind. You are exactly where you are supposed to be.',
      'Trust the process. You\'re growing in ways you can\'t even see yet.',
    ],
  },
  {
    id: 'self-recognition',
    title: '🪞 Read if you don\'t recognize yourself anymore',
    affirmations: [
      'Change is strange, isn\'t it? One day, you look in the mirror and realize you\'re not the same person you used to be. Maybe that scares you. Maybe you miss the old you. Maybe you wonder if you lost something along the way.',
      'But here\'s the truth: you are not lost. You are evolving. You are learning, shifting, adapting. Life shapes us, and sometimes, that means leaving behind parts of who we were to become who we are meant to be.',
      'You may not recognize yourself yet, but one day, you will. And when that day comes, I hope you look at the person you\'ve become with kindness.',
    ],
  },
  {
    id: 'proud',
    title: '🏆 Read if you need to hear "I\'m proud of you"',
    affirmations: [
      'I don\'t know what battle you fought today. I don\'t know what invisible weights you carried. But I know this—you\'re still here. And that alone is something to be proud of.',
      'The world may not always acknowledge your effort. There may be no trophies for the battles you fight within yourself. But let me be the one to say it: I see you. I see how hard you try, how much you care, how you keep going even when it\'s tough.',
      'And I\'m proud of you. So, so proud of you.',
    ],
  },
  {
    id: 'new-start',
    title: '🌿 Read if you\'re scared to start something new',
    affirmations: [
      'It\'s terrifying, isn\'t it? The unknown. The risk. The possibility of failure. But let me tell you something: fear is only loud when you\'re on the edge of something important.',
      'You don\'t have to be fearless. You just have to take one small step. And then another. You don\'t need to have it all figured out—you just need the courage to begin.',
      'Because the truth is, some of the most beautiful things in life start with uncertainty. And I have a feeling that whatever is ahead for you? It\'s going to be worth it.',
    ],
  },
  {
    id: 'homesick',
    title: '🏡 Read if you\'re homesick (for a person, a place, or a time in your life)',
    affirmations: [
      'Missing something that once felt like home is one of the hardest kinds of aches. Maybe it was a person. Maybe it was a moment in time that you didn\'t realize was special until it was gone.',
      'But home is not just one place, one person, one moment. It\'s something we carry with us. It\'s in the memories, in the lessons, in the way we keep pieces of the past alive in our hearts.',
      'And even though you miss it now, life has a way of giving us new homes, new people, new places that make us feel safe again. Give it time. You\'ll find your way back to that feeling.',
    ],
  },
  {
    id: 'understood',
    title: '🤝 Read if you just need someone to understand',
    affirmations: [
      'Sometimes, you don\'t need advice. You don\'t need solutions. You just need someone to sit beside you and say, "I get it. I see you."',
      'So here I am, sitting with you. You don\'t have to explain. You don\'t have to pretend. You are allowed to feel what you feel.',
      'And I hope you know—you are not alone.',
    ],
  },
];

const { width, height } = Dimensions.get('window');

const BackgroundAnimation = () => {
  const [stars] = useState(() => 
    Array(20).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 1,
    }))
  );

  const starAnimations = stars.map(() => new Animated.Value(0));

  useEffect(() => {
    const animateStars = () => {
      const animations = stars.map((star, index) => {
        return Animated.sequence([
          Animated.timing(starAnimations[index], {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(starAnimations[index], {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.stagger(100, animations).start(() => animateStars());
    };

    animateStars();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {stars.map((star, index) => (
        <Animated.View
          key={index}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity: starAnimations[index],
            },
          ]}
        />
      ))}
    </View>
  );
};

const StarAnimation = () => {
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.star, { transform: [{ rotate: spin }] }]}>
      <Text style={styles.starIcon}>★</Text>
    </Animated.View>
  );
};

export default function AffirmationsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<Affirmation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleCategoryPress = (category: Affirmation) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  return (
    <LinearGradient
      colors={['#2C1810', '#3C2415']}
      style={styles.container}
    >
      <BackgroundAnimation />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Self Affirmations</Text>
          <Text style={styles.subtitle}>Choose a category that resonates with you</Text>
        </View>

        <View style={styles.categoriesContainer}>
          {affirmations.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category)}
            >
              <LinearGradient
                colors={['#4A2F1C', '#3C2415']}
                style={styles.categoryGradient}
              >
                <StarAnimation />
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedCategory?.title}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.affirmationsList}>
              {selectedCategory?.affirmations.map((affirmation, index) => (
                <View key={index} style={styles.affirmationItem}>
                  <Text style={styles.starIcon}>★</Text>
                  <Text style={styles.affirmationText}>{affirmation}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(44, 24, 16, 0.5)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8D0AA',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  categoriesContainer: {
    padding: 15,
  },
  categoryCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  categoryGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    color: '#E8D0AA',
    marginLeft: 15,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFA500',
    borderRadius: 50,
    opacity: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#2C1810',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#FFA500',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFA500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    padding: 5,
  },
  affirmationsList: {
    flex: 1,
  },
  affirmationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#3C2415',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  affirmationText: {
    fontSize: 16,
    color: '#E8D0AA',
    marginLeft: 10,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  starIcon: {
    fontSize: 40,
    color: '#FFA500',
  },
  closeIcon: {
    fontSize: 24,
    color: '#FFA500',
  },
}); 