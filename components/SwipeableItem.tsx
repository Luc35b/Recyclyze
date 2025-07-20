import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Dimensions, View } from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SwipeableItemProps {
  id: number;
  text: string;
  onDelete: (id: number) => void;
  onPress: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const DELETE_BUTTON_WIDTH = SCREEN_WIDTH / 3;

const parseMarkdown = (text: string) => {
  const regex = /(\*\*.*?\*\*|\*.*?\*|###.*?###)/g; 

  return text.split(regex).map((part, index) => {
    if (part.startsWith('###') && part.endsWith('###')) {
      // Heading
      return (
        <Text key={index} style={styles.headingText}>
          {part.replace(/###/g, '').trim()}{' '}
        </Text>
      );
    } else if (part.startsWith('**') && part.endsWith('**')) {
      // Bold
      return (
        <Text key={index} style={styles.boldText}>
          {part.replace(/\*\*/g, '').trim()}{' '}
        </Text>
      );
    } else if (part.startsWith('*') && part.endsWith('*')) {
      // Italic
      return (
        <Text key={index} style={styles.italicText}>
          {part.replace(/\*/g, '').trim()}{' '}
        </Text>
      );
    } else if (part.trim().length > 0) {
      // Normal
      return (
        <Text key={index} style={styles.normalText}>
          {part}
        </Text>
      );
    }
    return null;
  });
};

const getFirstItalicWord = (text: string) => {
  const italicMatch = text.match(/\*(.*?)\*/);
  return italicMatch ? italicMatch[1] : null;
};

const SwipeableItem: React.FC<SwipeableItemProps> = ({ id, text, onDelete, onPress }) => {
  const renderRightActions = () => (
    <RectButton style={styles.deleteButton} onPress={() => onDelete(id)}>
      <MaterialCommunityIcons name="delete" size={24} color="white" />
      <Text style={styles.deleteText}>Delete</Text>
    </RectButton>
  );

  const previewText = getFirstItalicWord(text) || (text.length > 50 ? `${text.substring(0, 50)}...` : text);

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={DELETE_BUTTON_WIDTH}
    >
      <TouchableOpacity style={styles.itemWrapper} onPress={onPress}>
        <View style={styles.itemCard}>
          <Text numberOfLines={1}>{parseMarkdown(previewText)}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default SwipeableItem;

const styles = StyleSheet.create({
  itemWrapper: {
    width: SCREEN_WIDTH,
  },
  itemCard: {
    width: SCREEN_WIDTH,
    padding: 16,
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRadius: 8,
    marginVertical: 4,
  },
  headingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  italicText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
  },
  normalText: {
    fontSize: 16,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: DELETE_BUTTON_WIDTH,
    height: '87%',
    marginVertical: 4,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
  },
});