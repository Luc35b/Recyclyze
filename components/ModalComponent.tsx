import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';

type ModalComponentProps = {
  imageUri: string | null;
  responseText: string;
  isVisible: boolean;
  closeModal: () => void;
};

const parseMarkdown = (text: string): React.ReactNode[] => {
  const regex = /(\*\*.*?\*\*|\*.*?\*|###.*?###)/g;

  return text.split(regex).map((part: string, index: number) => {
    if (part.startsWith('###') && part.endsWith('###')) {
      return (
        <Text key={index} style={styles.headingText}>
          {part.replace(/###/g, '').trim()}{''}
        </Text>
      );
    } else if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={index} style={styles.boldText}>
          {part.replace(/\*\*/g, '').trim()}{''}
        </Text>
      );
    } else if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <Text key={index} style={styles.italicText}>
          {part.replace(/\*/g, '').trim()}{''}
        </Text>
      );
    } else if (part.trim().length > 0) {
      return (
        <Text key={index} style={styles.normalText}>
          {part}
        </Text>
      );
    }
    return null;
  });
};

const ModalComponent: React.FC<ModalComponentProps> = ({ imageUri, responseText, isVisible, closeModal }) => {
  const newText: string = responseText + '\n\n\n';

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.modalImage} />
          ) : null}
          <ScrollView style={styles.modalTextContainer}>
            <Text>{parseMarkdown(newText)}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    height: '70%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '40%',
    resizeMode: 'contain',
  },
  modalTextContainer: {
    flex: 1,
    padding: 16,
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
  closeButton: {
    padding: 16,
    backgroundColor: 'green',
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ModalComponent;