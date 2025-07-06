import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, BackHandler } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const vehicleTypes = [
  { id: '1', name: 'Swift Dzire'},
  { id: '2', name: 'Maruti Suzuki Baleno'},
  { id: '3', name: 'Maruti Suzuki Ciaz'},
  { id: '4', name: 'Maruti Suzuki Ertiga'},
];

const SelectCar = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [navigation]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <View style={styles.cardContent}>
        <View style={styles.carInfo}>
          <Text style={styles.vehicleName}>{item.name}</Text>
        </View>
        <View style={styles.cardAccent} />
        <View style={styles.arrowCircle}>
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Select Car</Text>
      </View>
      <FlatList
        data={vehicleTypes}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FF5722',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    zIndex: 2,
    padding: 4,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  listContent: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 22,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 18,
    position: 'relative',
  },
  cardAccent: {
    width: 6,
    height: 40,
    backgroundColor: '#FF5722',
    borderRadius: 6,
    marginHorizontal: 16,
    alignSelf: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginLeft: 0,
  },
  carInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    letterSpacing: 0.5,
  },
  arrowCircle: {
    backgroundColor: '#FF5722',
    borderRadius: 20,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    elevation: 2,
    shadowColor: '#FF5722',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  vehicleDesc: {
    fontSize: 14,
    color: '#888',
  },
});

export default SelectCar; 