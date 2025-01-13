import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './components/ThemeContext';

export default function App() {
  return (
    <NavigationContainer>
      <ThemeProvider>
      <AppNavigator />
      </ThemeProvider>
    </NavigationContainer>
  );
}
