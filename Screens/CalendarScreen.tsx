import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../components/ThemeContext';
import { themes } from '../components/ColorThemes';

const CalendarScreen: React.FC = () => {
  const { darkMode } = useTheme();
  const theme = darkMode ? themes.dark : themes.light;
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState<{ [date: string]: string[] }>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [newEventText, setNewEventText] = useState('');

  const handleDayPress = (day: any) => {

  if (selectedDate === day.dateString) {
    setSelectedDate('');
  } else {
    setSelectedDate(day.dateString);
  }
};

  const handleAddEvent = () => {
    if (!newEventText.trim()) {
      Alert.alert('Invalid Input', 'Please enter a valid event name.');
      return;
    }

    setEvents((prevEvents) => ({
      ...prevEvents,
      [selectedDate]: [...(prevEvents[selectedDate] || []), newEventText.trim()],
    }));
    setModalVisible(false);
    setNewEventText('');
    Alert.alert('Event Added', `Added "${newEventText.trim()}" to ${selectedDate}`);
  };

  const changeMonth = (direction: 'left' | 'right') => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + (direction === 'right' ? 1 : -1));
      return newDate;
    });
  };


  const calendarTheme = {
    textSectionTitleColor: theme.text,
    textSectionTitleFontWeight: 'bold',
    todayTextColor: theme.monoIcon,
    dayTextColor: theme.headerText,
    arrowColor: theme.headerText,
    monthTextColor: theme.headerText,
    selectedDayBackgroundColor: theme.selectedDateBackground,
    textDayFontWeight: '500',
    textMonthFontWeight: 'bold',
    textDayFontSize: 16,
    textMonthFontSize: 18,
    backgroundColor: theme.background,
    calendarBackground: theme.background,
    textDisabledColor: darkMode ? '#8D8D92' : '#DAE1E7',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Collection Days</Text>
      <Calendar
        key={darkMode ? 'dark' : 'light'}
        current={currentDate.toISOString().split('T')[0]}
        onDayPress={handleDayPress}
        monthFormat={'MMMM yyyy'}
        renderArrow={(direction) => (
          <Ionicons
            name={direction === 'left' ? 'chevron-back-outline' : 'chevron-forward-outline'}
            size={30}
            color={theme.headerText}
          />
        )}
        onPressArrowLeft={(subtractMonth) => {
          changeMonth('left');
          subtractMonth();
        }}
        onPressArrowRight={(addMonth) => {
          changeMonth('right');
          addMonth();
        }}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: theme.selectedDateBackground,
          },
        }}
        theme={calendarTheme}
      />
      {selectedDate && (
        <View style={[styles.eventsContainer, { backgroundColor: theme.eventBackground }]}>
          <Text style={[styles.eventsTitle, { color: theme.text }]}>
            Events on {selectedDate}:
          </Text>
          {events[selectedDate]?.length > 0 ? (
            events[selectedDate].map((event, index) => (
              <Text key={index} style={[styles.eventText, { color: theme.text }]}>
                - {event}
              </Text>
            ))
          ) : (
            <Text style={[styles.noEventsText, { color: theme.text }]}>
              No events for this day.
            </Text>
          )}
          <TouchableOpacity
            style={[styles.addEventButton, { backgroundColor: theme.buttonBackground }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[styles.addEventButtonText, { color: theme.buttonText }]}>
              Add Event
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Event</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.eventBackground, color: theme.text }]}
              placeholder="Enter event name"
              placeholderTextColor={theme.text}
              value={newEventText}
              onChangeText={setNewEventText}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.buttonBackground }]}
                onPress={handleAddEvent}
              >
                <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.buttonBackground }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 32,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  eventsContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventText: {
    fontSize: 16,
  },
  noEventsText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  addEventButton: {
    marginTop: 16,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addEventButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    width: '100%',
    height: 40,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});