import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons} from '@expo/vector-icons';
import { useTheme } from '../components/ThemeContext';
import { themes } from '../components/ColorThemes';
import ModalComponent from '../components/ModalComponent';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import SwipeableItem from '../components/SwipeableItem';
import { initDb, fetchItemsForBins, deleteItemById } from '../Sqlitedb';


type Bin = {
  title: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  binType: string;
};

const initialBins: Bin[] = [
  { title: 'Recycling Bin', iconName: 'recycle', binType: 'Recycle' },
  { title: 'Garbage Bin', iconName: 'trash-can-outline', binType: 'Garbage' },
  { title: 'Compost Bin', iconName: 'leaf', binType: 'Compost' },
  { title: 'Misc Bin', iconName: 'folder-outline', binType: 'Misc.' },
];

const HistoryScreen: React.FC = () => {
  const { darkMode } = useTheme();
  const [bins, setBins] = useState<Bin[]>(initialBins);
  const [searchText, setSearchText] = useState('');

const [selectedBinType, setSelectedBinType] = useState<string | null>(null);
  const [binItems, setBinItems] = useState<{ id: number; imageUri: string; responseText: string }[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  
 //const [data, setData] = useState<any[]>([]);

  useEffect(() => {
  const loadData = async () => {
    await initDb();
    if (selectedBinType) {
      try {
        const items = await fetchItemsForBins(selectedBinType);
        setBinItems(items);
      } catch (error) {
        console.error("Error fetching items:", error);
        setBinItems([]);
      }
    }
  };
  loadData();
}, [selectedBinType]);

  const theme = darkMode ? themes.dark : themes.light;

  const handleAddNewBin = () => {
    const newBinCount = bins.length - initialBins.length + 1;
    const newBin: Bin = {
      title: `Empty Bin ${newBinCount}`,
      iconName: 'folder-outline',
      binType: `Empty${newBinCount}`,
    };
    setBins((prevBins) => [...prevBins, newBin]);
  };

const handleDeleteItem = async (id: number) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteItemById(id);
          setBinItems((prevItems) => prevItems.filter(item => item.id !== id));
        },
      },
    ]);
  };

  const renderRightActions = (id: number) => (
    <RectButton style={styles.deleteButton} onPress={() => handleDeleteItem(id)}>
      <MaterialCommunityIcons name="delete" size={24} color="white" />
      <Text style={styles.deleteText}>Delete</Text>
    </RectButton>
  );


  const openModal = (item: any) => {
    setModalData(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalData(null);
  };

  const handleClearSearch = () => {
    setSearchText('');
  };

  const filteredItems = binItems.filter((item) =>
    item.responseText.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredBins = bins.filter((bin) =>
    bin.title.toLowerCase().includes(searchText.toLowerCase())
  );
  
  const handleBinClick = async (binType: any ) => {
  setSelectedBinType(binType);
  try {
    const items = await fetchItemsForBins(binType);
    setBinItems(items);
  } catch (error) {
    console.error(`No items found for bin type: ${binType}`, error);
    setBinItems([]);
  }
};


  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.headerBackground,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Search bins..."
          placeholderTextColor={theme.monoIcon}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <MaterialCommunityIcons name="close-circle" size={24} color={theme.text} />
          </TouchableOpacity>
        )}
      </View>
      {selectedBinType ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity onPress={() => setSelectedBinType(null)} style={styles.card}>
            <Text style={{ color: theme.text}} >Back to Bins</Text>
          </TouchableOpacity>
          {filteredItems.map((item) => (
  <SwipeableItem
    key={item.id}
    id={item.id}
    text={item.responseText}
    onDelete={handleDeleteItem}
    onPress={() => openModal(item)}
  />
))}
        </ScrollView>
      ) : (
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        onScroll={() => Keyboard.dismiss()}
        keyboardShouldPersistTaps="handled"
      >
        {filteredBins.map((bin, index) => (
  <TouchableOpacity
    key={index}
    style={[styles.card, { backgroundColor: theme.eventBackground }]}
    onPress={() => handleBinClick(bin.binType)}
  >
    <MaterialCommunityIcons
      name={bin.iconName}
      size={80}
      color={theme.buttonBackground}
    />
    <Text style={[styles.cardText, { color: theme.text }]}>{bin.title}</Text>
  </TouchableOpacity>
))}
        {bins.length < 20 && filteredBins.length === bins.length && (
          <TouchableOpacity style={[styles.card, { backgroundColor: theme.eventBackground }]} onPress={handleAddNewBin}>
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={80}
              color={darkMode ? '#777' : '#aaa'}
            />
            <Text style={[styles.cardText, { color: theme.text }]}>Add New Bin</Text>
          </TouchableOpacity>
        )}
       
      </ScrollView>
      )}
      <ModalComponent
  imageUri={modalData?.imageUri}
  responseText={modalData?.responseText}
  isVisible={isModalVisible}
  closeModal={closeModal}
/>
    </View>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
  searchBarContainer: {
    position: 'relative',
    marginHorizontal: 16,
    marginTop: 10,
  },
  searchBar: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 8,
    marginVertical: 5,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 5,
  },
});