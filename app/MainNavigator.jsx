import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Index from './(tabs)/index';
import Otp from './(tabs)/Otp'; 
import Login from './(tabs)/Login'; 
import Temp from './(tabs)/Temp'; 



const Stack = createNativeStackNavigator(); // Create a stack navigator

export default function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login" // Initial screen when app loads
      screenOptions={{
        headerShown: false, // Hide the header for all screens
      }}
    >
      <Stack.Screen name="Index" component={Index} />
      <Stack.Screen name="Login" component={Login} />

      <Stack.Screen name="Otp" component={Otp} />
      <Stack.Screen name="Temp" component={Temp} />



 
      
    </Stack.Navigator>
  );
}
