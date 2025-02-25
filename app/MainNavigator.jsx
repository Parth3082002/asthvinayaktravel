import React from 'react';
import { createStackNavigator } from "@react-navigation/stack"; // ✅ Ensure @react-navigation/stack is installed
import Index from './(tabs)/index';
import Otp from './(tabs)/Otp'; 
import Login from './(tabs)/Login';
import SelectVehicle1 from './(tabs)/SelectVehicle1'; 
import SelectTour1 from './(tabs)/SelectTour1'; 
import Home from './(tabs)/Home';
import Registration from './(tabs)/Registration';
import Book from './(tabs)/Book';
import Standardpu12 from './(tabs)/Standardpu12';
import SelectSeats from './(tabs)/SelectSeats';
import SelectDate from './(tabs)/SelectDate'; // ✅ Add missing import
import Dashboard from './(tabs)/Dashboard';
import Bappa1 from './(tabs)/Bappa1';
import Bappa2 from './(tabs)/Bappa2';
import Bappa3 from './(tabs)/Bappa3';
import Bappa4 from './(tabs)/Bappa4';
import Bappa5 from './(tabs)/Bappa5';
import Bappa6 from './(tabs)/Bappa6';
import Bappa7 from './(tabs)/Bappa7';
import Bappa8 from './(tabs)/Bappa8';
import History from './(tabs)/History';
import CarType from './(tabs)/CarType';
import CarBook from './(tabs)/CarBook';

const Stack = createStackNavigator(); 

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
      <Stack.Screen name="SelectVehicle1" component={SelectVehicle1} />

      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="SelectTour1" component={SelectTour1} />
      <Stack.Screen name="Standardpu12" component={Standardpu12} />
      <Stack.Screen name="SelectDate" component={SelectDate} /> {/* ✅ Fixed */}
      <Stack.Screen name="Book" component={Book} />
      <Stack.Screen name="SelectSeats" component={SelectSeats} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Bappa1" component={Bappa1} />
      <Stack.Screen name="Bappa2" component={Bappa2} />
      <Stack.Screen name="Bappa3" component={Bappa3} />
      <Stack.Screen name="Bappa4" component={Bappa4} />
      <Stack.Screen name="Bappa5" component={Bappa5} />
      <Stack.Screen name="Bappa6" component={Bappa6} />
      <Stack.Screen name="Bappa7" component={Bappa7} />
      <Stack.Screen name="Bappa8" component={Bappa8} />
      <Stack.Screen name="History" component={History} />
      <Stack.Screen name="CarType" component={CarType} />
      <Stack.Screen name="CarBook" component={CarBook} />
    </Stack.Navigator>
  );
}
