import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Importing useNavigation

const SelectVehicle = () => {
  const navigation = useNavigation(); // Using the hook to get navigation

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
          <View style={styles.backButtonCircle}>
            <Text style={styles.backButton}>{'<'}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.navbarTitle}>Pick Your Perfect Vehicle!</Text>
      </View>

      {/* Vehicle Options */}
      <View style={styles.vehicleContainer}>
        {/* By Bus */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('SelectTour', { vehicleType: 'Bus' })}>
          <Image source={require('@/assets/images/Bus.png')} style={styles.image} />
          <Text style={styles.label}>By Bus</Text>
        </TouchableOpacity>

        {/* By Car */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('SelectTour', { vehicleType: 'Car' })}>
          <Image source={require('@/assets/images/Car.png')} style={styles.image} />
          <Text style={styles.label}>By Car</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
    marginTop:-20,
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
