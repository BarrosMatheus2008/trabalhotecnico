// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/services/HomeScreen';
import FormScreen from './src/services/FormScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen 
          name="HomeScreen" 
          component={HomeScreen} 
          options={{ title: 'Controle de Estudos' }} 
        />
        <Stack.Screen 
          name="FormScreen" 
          component={FormScreen} 
          options={{ title: 'Gerenciar Estudo' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}