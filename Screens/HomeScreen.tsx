import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../components/ThemeContext';
import { themes } from '../components/ColorThemes';
import { getChatGptResponse, analyzeImageWithOpenAI } from '../OpenaiService';
import ModalComponent from '../components/ModalComponent';
import { initDb, saveImageData } from '../Sqlitedb';

const HomeScreen = ({ location }: { location: string }) => {
  const { darkMode } = useTheme();
  const theme = darkMode ? themes.dark : themes.light;

  const [searchText, setSearchText] = useState('');
  const [recentImages, setRecentImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [searchResponseText, setSearchResponseText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  //const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const initializeDatabase = async () => {
      await initDb();
    };
    initializeDatabase();
  }, []);

  const handleTakePic = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'We need access to your camera to take a picture.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [16, 9],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const selectedImageUri = result.assets[0].uri;
        setRecentImages((prevImages) =>
          [selectedImageUri, ...prevImages].slice(0, 2)
        );
      }

      if (
        !result.canceled &&
        result.assets?.[0]?.base64 &&
        result.assets?.[0]?.uri
      ) {
        const capturedImageUri = result.assets[0].uri;
        const capturedImageBase64 = result.assets[0].base64;

        await analyzeImage(capturedImageBase64, capturedImageUri);
      }
    } catch (error) {
      console.error('Error taking a picture: ', error);
      Alert.alert('Error', 'Something went wrong while taking a picture.');
    }
  };

  const handleChooseFromLibrary = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'We need access to your photo library to select an image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const selectedImageUri = result.assets[0].uri;
        setRecentImages((prevImages) =>
          [selectedImageUri, ...prevImages].slice(0, 2)
        );
      }

      if (
        !result.canceled &&
        result.assets?.[0]?.base64 &&
        result.assets?.[0]?.uri
      ) {
        const selectedImageUri = result.assets[0].uri;
        const selectedImageBase64 = result.assets[0].base64;

        // Analyze the image with OpenAI
        await analyzeImage(selectedImageBase64, selectedImageUri);
      }
    } catch (error) {
      console.error('Error picking an image: ', error);
      Alert.alert('Error', 'Something went wrong while selecting an image.');
    }
  };

  const extractBinType = (response: string): string => {
    const match = response.match(/\*\*(.*?)\*\*/);
    return match ? match[1] : 'Unknown';
  };

  const analyzeImage = async (base64Image: string, imageUri: string) => {
    setLoading(true);
    try {
      const response = await analyzeImageWithOpenAI(base64Image, location);
      setResponseText(response);
      setSelectedImage(imageUri);
      setModalVisible(true);

      // Extract binType
     const binType = extractBinType(response);
      //const binType = "Recycle";

      await saveImageData(imageUri, binType, response);
    } catch (err) {
      Alert.alert('Error', 'Failed to analyze the image: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim()) {
      Alert.alert('Empty Input', 'Please enter a prompt to search.');
      return;
    }

    setLoading(true);
    try {
      const response = await getChatGptResponse(searchText);
      setSearchResponseText(response);
      setModalVisible(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch response from GPT: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={[styles.container]}>
        <View
          style={[
            styles.searchContainer,
            {
              borderColor: theme.border,
              backgroundColor: theme.headerBackground,
            },
          ]}>
          <TextInput
            style={[
              styles.searchBar,
              { backgroundColor: theme.headerBackground, color: theme.text },
            ]}
            placeholder="Ask BinBot..."
            placeholderTextColor={theme.monoIcon}
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSearch}>
            <Ionicons name="send" size={24} color={theme.monoIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.cameraButtonContainer}>
          <TouchableOpacity
            style={[
              styles.cameraButton,
              { backgroundColor: theme.buttonBackground },
            ]}
            onPress={handleTakePic}>
            <Ionicons name="camera" size={40} color={theme.buttonText} />
          </TouchableOpacity>
          <Text style={[styles.cameraButtonText, { color: theme.text }]}>
            Take a Pic / Ready to Scan
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.libraryButton,
            { backgroundColor: theme.buttonBackground },
          ]}
          onPress={handleChooseFromLibrary}>
          <Text style={[styles.libraryButtonText, { color: theme.buttonText }]}>
            Choose from Library
          </Text>
        </TouchableOpacity>

        <View style={styles.recentImagesContainer}>
          <Text style={[styles.recentImagesTitle, { color: theme.text }]}>
            Recent Images
          </Text>
          <View style={styles.recentImages}>
            {recentImages.length > 0 ? (
              recentImages.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => console.log(`Clicked on ${image}`)}>
                  <Image source={{ uri: image }} style={styles.image} />
                </TouchableOpacity>
              ))
            ) : (
              <Text
                style={[styles.noRecentImagesText, { color: theme.monoIcon }]}>
                No recent images to display.
              </Text>
            )}
          </View>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.text} />
          </View>
        )}

        <ModalComponent
          isVisible={modalVisible}
          responseText={searchResponseText || responseText}
          imageUri={selectedImage}
          closeModal={() => setModalVisible(false)}
        />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  searchBar: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
  },
  sendButton: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  cameraButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  libraryButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  libraryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recentImagesContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  recentImagesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recentImages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  image: {
    width: 150,
    height: 200,
    borderRadius: 16,
    marginHorizontal: 15,
    marginTop: 20,
  },
  noRecentImagesText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
