import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import FormScreen from './src/screens/FormScreen';
import AboutScreen from './src/screens/AboutScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Cadastrar' }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ title: 'Sobre a Aplicação' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Meus Estudos' }} />
        <Stack.Screen name="Form" component={FormScreen} options={{ title: 'Gerenciar Estudo' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Meu Perfil' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}