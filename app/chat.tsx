import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import Voice from '@react-native-voice/voice'; // 👈 for speech-to-text
import AsyncStorage from '@react-native-async-storage/async-storage'; // 👈 for saving chat history

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const API_URL = 'https://sahara-server.onrender.com/chat';

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const typingDotsAnim = useRef(new Animated.Value(0)).current;

  // Load chat history from AsyncStorage on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const savedMessages = await AsyncStorage.getItem('chatHistory');
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        } else {
          setMessages([{
            id: '1',
            text: "Hello! I'm your AI companion. How are you today?",
            isUser: false,
            timestamp: new Date(),
          }]);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };

    loadChatHistory();

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechEnd = () => setIsListening(false);

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = (event: any) => {
    const speech = event.value[0];
    setInputText(speech);
  };

  const startListening = async () => {
    try {
      await Voice.start('en-US');
      setIsListening(true);
    } catch (error) {
      console.error('Voice error:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, userMessage];
      return updatedMessages;
    });

    setInputText('');
    setIsLoading(true);
    animateTypingDots();

    try {
      const response = await axios.post(API_URL, { message: userMessage.text }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 && response.data && response.data.reply) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.reply,
          isUser: false,
          timestamp: new Date(),
        };

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, aiMessage];
          return updatedMessages;
        });

        // Save the updated history to AsyncStorage
        await AsyncStorage.setItem('chatHistory', JSON.stringify([...messages, userMessage, aiMessage]));
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error sending message:', error);

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const animateTypingDots = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingDotsAnim, {
          toValue: 3,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(typingDotsAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.isUser ? styles.userMessageText : styles.aiMessageText,
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            item.isUser ? styles.userTimestamp : styles.aiTimestamp,
          ]}
        >
          {item.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );

  const renderTypingDots = () => {
    const dots = ['.', '.', '.'];
    const visibleDots = Math.floor(typingDotsAnim.__getValue());

    return (
      <Text style={styles.typingText}>
        AI is typing{dots.slice(0, visibleDots).join('')}
      </Text>
    );
  };

  return (
    <LinearGradient colors={['#F5F5F5', '#FFFFFF']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item: Message) => item.id}
          contentContainerStyle={styles.messagesList}
        />
        {isLoading && (
          <View style={styles.typingContainer}>{renderTypingDots()}</View>
        )}
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={startListening} style={styles.micButton}>
            <Text style={styles.iconText}>🎤</Text> {/* Wrap the icon in a Text component */}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type or speak..."
            placeholderTextColor="#666"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.iconText}>📝</Text> {/* Changed icon */}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  messagesList: { padding: 16, paddingBottom: 80 },
  messageContainer: { marginBottom: 16, maxWidth: '80%' },
  userMessage: { alignSelf: 'flex-end' },
  aiMessage: { alignSelf: 'flex-start' },
  messageBubble: { padding: 12, borderRadius: 20 },
  userBubble: { backgroundColor: '#4A90E2' },
  aiBubble: { backgroundColor: '#F5F5F5' },
  messageText: { fontSize: 16, fontFamily: 'Poppins' },
  userMessageText: { color: '#FFFFFF' },
  aiMessageText: { color: '#333333' },
  timestamp: { fontSize: 12, marginTop: 4, alignSelf: 'flex-end' },
  userTimestamp: { color: '#FFFFFF' },
  aiTimestamp: { color: '#666666' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#333',
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginLeft: 8,
  },
  sendButtonDisabled: { opacity: 0.5 },
  micButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  typingContainer: { alignItems: 'flex-start', paddingLeft: 20, paddingBottom: 5 },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999',
  },
  iconText: { fontSize: 24, color: '#666' },
});
