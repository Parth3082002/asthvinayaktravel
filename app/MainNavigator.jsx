import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Index from './(tabs)/index';
import Otp from './(tabs)/Otp'; 
import Login from './(tabs)/Login';
import SelectVehicle from './(tabs)/SelectVehicle'; 
import ConfirmDetails from './(tabs)/ConfirmDetails'; 
import SelectTour from './(tabs)/SelectTour'; // Import the SelectTour component
import Home from './(tabs)/Home';
import Registration from './(tabs)/Registration';
import Book from './(tabs)/Book';

const Stack = createNativeStackNavigator(); // Create a stack navigator

export default function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home" // Set the initial route to SelectTour
      screenOptions={{
        headerShown: false, // Hide the header for all screens
      }}
    >
      
     
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Book" component={Book} />
      <Stack.Screen name="Index" component={Index} />
      <Stack.Screen name="Registration" component={Registration} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Otp" component={Otp} />
      <Stack.Screen name="SelectVehicle" component={SelectVehicle} />
      <Stack.Screen name="ConfirmDetails" component={ConfirmDetails} />
      <Stack.Screen name="SelectTour" component={SelectTour} /> {/* Add the SelectTour screen */}
    </Stack.Navigator>
  );
}
