import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

let db: SQLite.SQLiteDatabase;

const initializeDb = async () => {
  db = await SQLite.openDatabaseAsync('recyclingApp.db');
};

const checkDbInitialized = async (): Promise<boolean> => {
  const initialized = await AsyncStorage.getItem('db_initialized');
  return initialized === 'true';
};

const setDbInitialized = async () => {
  await AsyncStorage.setItem('db_initialized', 'true');
};

export const initDb = async () => {
  await initializeDb();
  const isInitialized = await checkDbInitialized();
  if (isInitialized) return;

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY NOT NULL,
      imageUri TEXT NOT NULL,
      binType TEXT NOT NULL,
      responseText TEXT NOT NULL
    );
  `);

  await setDbInitialized();
};

export const saveImageData = async (imageUri: string, binType: string, responseText: string) => {
   try {
    const result = await db.runAsync(
      'INSERT INTO images (imageUri, binType, responseText) VALUES (?, ?, ?)',
      imageUri, binType, responseText
    );
    console.log('Data saved successfully!', result.lastInsertRowId);
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const fetchItemsForBins = async (binType: string): Promise<{ id: number; imageUri: string; responseText: string }[]> => {
  const result = await db.getAllAsync(
    'SELECT * FROM images WHERE binType = ?',
    binType
  );
  return result;
};

export const deleteItemById = async (id: number) => {
  try {
    await db.runAsync('DELETE FROM images WHERE id = ?', id);
    console.log(`Item with ID ${id} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting item:', error);
  }
};