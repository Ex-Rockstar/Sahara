import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';

const QuickRelaxingScreen = () => {
  const categories = [
    {
      title: 'Meditation',
      icon: 'leaf',
      description: 'Find peace through guided meditation',
      color: '#4CAF50',
      features: ['Breathing exercises', 'Mindfulness', 'Body scan'],
    },
    {
      title: 'Sound Therapy',
      icon: 'musical-notes',
      description: 'Calm your mind with soothing sounds',
      color: '#2196F3',
      features: ['Rain sounds', 'Ocean waves', 'Forest ambiance'],
    },
    {
      title: 'Yoga Therapy',
      icon: 'fitness',
      description: 'Relax through gentle yoga poses',
      color: '#FF9800',
      features: ['Beginner poses', 'Stress relief', 'Flexibility'],
    },
    {
      title: 'Guided Therapy',
      icon: 'chatbubbles',
      description: 'Self-reflection and CBT exercises',
      color: '#9C27B0',
      features: ['Journal prompts', 'CBT exercises', 'Self-care tips'],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.header}>Quick Relaxing</Text>
        <Text style={styles.subheader}>Choose a method to unwind</Text>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.title}
            style={[styles.categoryCard, { borderLeftColor: category.color }]}
          >
            <View style={styles.categoryHeader}>
              <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon as any} size={24} color="#FFF" />
              </View>
              <View style={styles.categoryTitleContainer}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </View>
            </View>
            <View style={styles.featuresContainer}>
              {category.features.map((feature) => (
                <View key={feature} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={category.color} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  categoryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
  },
  featuresContainer: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default QuickRelaxingScreen; 