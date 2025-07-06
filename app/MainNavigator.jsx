import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
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
import SelectDate from './(tabs)/SelectDate';
import History from './(tabs)/History';
import CarType from './(tabs)/CarType';
import CarBook from './(tabs)/CarBook';
import PaymentScreen from './(tabs)/PaymentScreen';
import SelectCar from './(tabs)/SelectCar';

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
      <Stack.Screen name="SelectVehicle1" component={SelectVehicle1} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="SelectTour1" component={SelectTour1} />
      <Stack.Screen name="Standardpu12" component={Standardpu12} />
      <Stack.Screen name="SelectDate" component={SelectDate} />
      <Stack.Screen name="Book" component={Book} />
      <Stack.Screen name="SelectSeats" component={SelectSeats} />
      <Stack.Screen name="History" component={History} />
      <Stack.Screen name="CarType" component={CarType} />
      <Stack.Screen name="CarBook" component={CarBook} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SelectCar" component={SelectCar} />
    </Stack.Navigator>
  );
}