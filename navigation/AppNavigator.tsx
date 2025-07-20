import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../components/ThemeContext';
import HomeScreen from '../Screens/HomeScreen';
import CalendarScreen from '../Screens/CalendarScreen';
import HistoryScreen from '../Screens/HistoryScreen';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { getHeaderTitle } from '@react-navigation/elements';
import { themes } from '../components/ColorThemes';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { darkMode } = useTheme();
  const theme = darkMode ? themes.dark : themes.light;
  const [location, setLocation] = useState('Not Set');

  return (
    <Tab.Navigator
      screenOptions={({ route, }: {
        route: any }) => ({
        tabBarIcon: ({
          focused,
          color,
          size,
        }: {
          focused: boolean;
          color: string;
          size: number;
        }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.buttonBackground,
        tabBarInactiveTintColor: theme.buttonInactiveBackground,
        animation: 'shift',
        tabBarStyle: { backgroundColor: theme.headerBackground },
        header: ({ navigation,
          route,
          options,
        }: {
          navigation: any;
          route: any;
          options: any }) => {
          const title = getHeaderTitle(options, route.name);
          return <Header title={title} onLocationUpdate={setLocation}/>;
        },
        headerStyle: {
          backgroundColor: theme.headerBackground,
        },
      })}
    >
      <Tab.Screen 
  name="Home">
  {() => <HomeScreen location={location} />}
</Tab.Screen>
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;