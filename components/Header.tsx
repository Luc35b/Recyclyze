import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, TextInput } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../components/ThemeContext';
import { themes } from '../components/ColorThemes';
import * as Location from 'expo-location';

type HeaderProps = {
  title: string;
  onLocationUpdate: (location: string) => void;
};

const Header: React.FC<HeaderProps> = ({ title, onLocationUpdate }) => {

  const { darkMode, toggleTheme } = useTheme();
  const theme = darkMode ? themes.dark : themes.light;
  const [modalVisible, setModalVisible] = useState(false);
  const [location, setLocation] = useState<string>('Not Set');
  //const [locationEnabled, setLocationEnabled] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationInput, setLocationInput] = useState(location);

  const handleLocationPress = async () => {
    if (location === 'Not Set' && !isEditingLocation) {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        //setLocationEnabled(true);
        const locationData = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = locationData.coords;
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        const address = geocode.length > 0 ? `${geocode[0].city}, ${geocode[0].country}` : 'Unknown Location';
        setLocation(address);
        setLocationInput(address);
        onLocationUpdate(address);
      } else {
        //setLocationEnabled(false);
        setLocation('Location not available');
      }
    } else if (!isEditingLocation) {
      setIsEditingLocation(true);
      setLocationInput(location);
    }
  };

  const handleLocationSave = () => {
    setLocation(locationInput);
    setIsEditingLocation(false);
    onLocationUpdate(locationInput);
  };


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.headerBackground }]}>
      <View style={[styles.container, { backgroundColor: theme.headerBackground, borderBottomColor: darkMode ? '#444' : '#e5e5e5' }]}>
        <MaterialIcons name="account-circle" size={45} color={darkMode ? '#aaa' : '#333'} style={styles.icon} />
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="settings-outline" size={40} color={theme.monoIcon} />
        </TouchableOpacity>
      </View>

      {/* Settings modal for Light/Dark Mode and Location Text */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.eventBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Settings</Text>
            <View style={styles.settingRow}>
              <Text style={[styles.settingText, { color: theme.text }]}>Dark Mode</Text>
              <Switch value={darkMode} onValueChange={toggleTheme} />
            </View>
            <View style={styles.locationContainer}>
              <Text style={[styles.locationLabel, { color: theme.text }]}>Location</Text>
              <TouchableOpacity onPress={handleLocationPress}>
                <Text style={[styles.locationText, { color: '#1592FF'}]}>
                  {location}
                </Text>
              </TouchableOpacity>
            </View>
            {isEditingLocation && (
              <View style={styles.locationInputContainer}>
                <TextInput
                  value={locationInput}
                  onChangeText={setLocationInput}
                  style={[styles.locationInput,{ color: theme.buttonText }]}
                  placeholder="Enter location"
                />
                <TouchableOpacity onPress={handleLocationSave}>
                  <Text style={[styles.saveButton, { color: theme.buttonText }]}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.buttonBackground }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: theme.buttonText }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Header;

const styles = StyleSheet.create({
  safeArea: {
    flex: 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 70,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    marginBottom: -35,
  },
  icon: {
    borderRadius: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  settingText: {
    fontSize: 16,
  },
  locationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  locationLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  locationText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  locationInputContainer: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    width: '80%',
    marginBottom: 10,
    borderRadius: 5,
  },
  saveButton: {
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    fontWeight: 'bold',
  },
});