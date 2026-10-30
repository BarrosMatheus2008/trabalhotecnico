import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import HomeScreen from './HomeScreen';
import FormScreen from './FormScreen';
import AboutScreen from './AboutScreen';
import ProfileScreen from './ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Cadastrar' }} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Form" component={FormScreen} options={{ title: 'Gerenciar Estudo' }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ title: 'Sobre o Aplicativo' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Meu Perfil' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}