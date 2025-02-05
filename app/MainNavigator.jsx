import React from 'react';
import { createStackNavigator } from "@react-navigation/stack"; // ✅ Ensure @react-navigation/stack is installed
import Index from './(tabs)/index';
import Otp from './(tabs)/Otp'; 
import Login from './(tabs)/Login';
import SelectVehicle from './(tabs)/SelectVehicle'; 
import SelectTour from './(tabs)/SelectTour'; 
import Home from './(tabs)/Home';
import Registration from './(tabs)/Registration';
import Book from './(tabs)/Book';
import Standardpu12 from './(tabs)/Standardpu12';
import SelectSeats from './(tabs)/SelectSeats';
import SelectDate from './(tabs)/SelectDate'; // ✅ Add missing import

const Stack = createStackNavigator(); // ✅ Correct stack creation

export default function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Index" 
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Index" component={Index} />
      <Stack.Screen name="Registration" component={Registration} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Otp" component={Otp} />
      <Stack.Screen name="SelectVehicle" component={SelectVehicle} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="SelectTour" component={SelectTour} />
      <Stack.Screen name="Standardpu12" component={Standardpu12} />
      <Stack.Screen name="SelectDate" component={SelectDate} /> {/* ✅ Fixed */}
      <Stack.Screen name="Book" component={Book} />
      <Stack.Screen name="SelectSeats" component={SelectSeats} />
    </Stack.Navigator>
  );
}
