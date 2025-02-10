import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function SelectVehicle() {
  const nav = useNavigation();
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    // Fetch the saved vehicle type from AsyncStorage
    const getStoredVehicleType = async () => {
      try {
        const storedVehicle = await AsyncStorage.getItem('vehicleType');
        if (storedVehicle) {
          setSelectedVehicle(storedVehicle); // Set the selected vehicle from storage
        }
      } catch (error) {
        console.error('Error retrieving vehicle type:', error);
      }
    };

    getStoredVehicleType();

    // BackHandler to navigate to the index page
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      nav.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
      return true;
    });

    return () => backHandler.remove();
  }, [nav]);

  const handleVehicleSelect = async (vehicleType) => {
    console.log('Selected Vehicle Type:', vehicleType);
    try {
      // Store the selected vehicle type in AsyncStorage
      await AsyncStorage.setItem('vehicleType', vehicleType);
      setSelectedVehicle(vehicleType); // Update local state
      nav.navigate('Home', { vehicleType });
    } catch (error) {
      console.error('Error saving vehicle type:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => nav.navigate('Dashboard')} style={styles.backButtonContainer}>
          <View style={styles.backButtonCircle}>
            <Text style={styles.backButton}>{'<'}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.navbarTitle}>Pick Your Perfect Vehicle!</Text>
      </View>

      {/* Vehicle Options */}
      <View style={styles.vehicleContainer}>
        <TouchableOpacity
          style={[styles.card, selectedVehicle === 'Bus' && styles.selectedCard]} // Highlight selected card
          onPress={() => handleVehicleSelect('Bus')}
        >
          <Image source={require('@/assets/images/Bus.png')} style={styles.image} />
          <Text style={styles.label}>By Bus</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, selectedVehicle === 'Car' && styles.selectedCard]} // Highlight selected card
          onPress={() => handleVehicleSelect('Car')}
        >
          <Image source={require('@/assets/images/Car.png')} style={styles.image} />
          <Text style={styles.label}>By Car</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonContainer: {
    marginRight: 10,
  },
  backButtonCircle: {
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4, // Adds shadow on Android
    marginTop: -20,
  },
  backButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  navbarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 60,
    marginLeft: 10,
  },
  vehicleContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginTop: 20,
  },
  selectedCard: {
    // Remove border and highlight when selected
    borderColor: 'transparent', // No border
    borderWidth: 0, // Remove any border width
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  label: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 10,
    color: '#000',
  },
});

export default SelectVehicle;
