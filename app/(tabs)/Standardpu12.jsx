import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  ScrollView, Image, ImageBackground, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, BackHandler,
  Platform,
} from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

import Svg, { Line, Circle } from 'react-native-svg';

import Day1 from '../../assets/images/Day1.png';
import Day2 from '../../assets/images/Day2.png';
import Day3 from '../../assets/images/Day3.png';
import Day4 from '../../assets/images/Day4.png';
import Day5 from '../../assets/images/Day5.png';

const PackageDetails = ({ route: propRoute }) => {
  const route = useRoute();
  const [error, setError] = useState(null);

  const routeParams = route.params || {};
  const { 
    selectedCategory, 
    selectedCategoryName,
    selectedPackage, 
    selectedPackageName,
    selectedCityId, 
    selectedCityName,
    destinationId,
    destinationName,
    vehicleType, 
    selectedVehicleId,
    selectedBus,
    childWithSeatP, 
    childWithoutSeatP,
    price,
    withoutBookingAmount,
    tuljapur,
    carTotalSeat,
    carPackagePrice
  } = route.params || {};
  const categoryId = propRoute?.categoryId || routeParams.categoryId;
  const packageId = propRoute?.packageId || routeParams.packageId;

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredPickupPoints, setFilteredPickupPoints] = useState([]); // For filtered locations
  const [selectedPickupPointId, setSelectedPickupPointId] = useState(null);
  const navigation = useNavigation();

  const { categoryName, packageName } = route.params || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);

  // Replace 'YOUR_API_KEY' with your actual Google API key
  const GOOGLE_API_KEY = 'AIzaSyDIbGxw6DSe8F_TKAa7l85F5Wg55I8j-e8';

  const clearAllState = () => {
    setSelectedPickupPoint('');
    setSelectedPickupPointId(null);
    setSearchQuery('');
    setShowDropdown(false);
    setShowPredictions(false);
    setPredictions([]);
    // ...clear any other relevant state
  };

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        clearAllState();
        navigation.navigate('SelectVehicle1');
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }, [])
  );

  useEffect(() => {
    if (selectedCityId && selectedCategory && selectedPackage && selectedCityName) {
      fetchPackageDetails(selectedCityId, selectedCategory, selectedPackage);
      fetchPickupPoints(selectedCityId);  // Fetch pickup points
    } else {
      setLoading(false);
      setError("Invalid parameters received");
    }
  }, [selectedCityId, selectedCategory, selectedPackage, selectedCityName]);

  const images = [Day1, Day2, Day3, Day4, Day5]; // Array of images

  const fetchPackageDetails = async (cityId, categoryId, packageId) => {
    try {
      setLoading(true);
      setError(null);
      const encodedPackageId = encodeURIComponent(packageId);
      const apiUrl = `https://newenglishschool-001-site1.ktempurl.com/api/Package/GetPackagePrice/${cityId}/${categoryId}/${encodedPackageId}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }

      const data = await response.json();

      // Check if categoryId is available in the response data
      const fetchedCategoryId = data?.categoryId || categoryId; // Fallback to the original categoryId if not in response
      setPackageData({ ...data, categoryId: fetchedCategoryId });
    } catch (error) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPickupPoints = async (cityId) => {
    // Only fetch pickup points from API if selectedBus is true
    if (!selectedBus) {
      console.log('=== Using Google API for pickup location search (selectedBus=false) ===');
      setPickupPoints([]);
      setFilteredPickupPoints([]);
      return;
    }

    try {
      console.log('=== Using API for pickup points (BUS/selectedBus=true) ===');
      const apiUrl = `https://newenglishschool-001-site1.ktempurl.com/api/Pickup/City/${cityId}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch pickup points');
      }

      const data = await response.json();
      if (data.data) {
        // Ensure all items follow a consistent naming convention
        const formattedData = data.data.map(point => ({
          ...point,
          pickupPointId: point.pickupPointID, // Normalize key name
        }));
        setPickupPoints(formattedData);
        setFilteredPickupPoints(formattedData);
        console.log('Pickup points loaded from API:', formattedData.length);
      } else {
        setPickupPoints([]);
        setFilteredPickupPoints([]);
      }
    } catch (error) {
      console.error('Error fetching pickup points:', error);
      setError("Failed to fetch pickup points");
    }
  };

  const handleBookNow = () => {
    if (!selectedPickupPoint.trim()) {
      alert("Please select a pickup location first");
      return;
    }

    console.log("=== Standardpu12 - Navigating to next page ===");
    console.log("Price:", packageData.adultPrice);

    if (selectedBus) {
      console.log('=== Standardpu12 - Navigating to SelectDate (BUS) ===');
      console.log('All parameters being passed:', {
        cityName: packageData.city,
        cityId: selectedCityId,
        packageName: packageData.packageName,
        packageId: packageData.packageId,
        categoryName: selectedCategoryName,
        categoryId: packageData.categoryId,
        selectedPickupPoint: selectedPickupPoint,
        selectedPickupPointId: selectedPickupPointId,
        price: packageData.adultPrice,
        vehicleType: vehicleType,
        selectedVehicleId: selectedVehicleId,
        selectedBus: selectedBus,
        childWithSeatP: childWithSeatP,
        childWithoutSeatP: childWithoutSeatP,
        withoutBookingAmount: withoutBookingAmount,
        destinationId: destinationId,
        destinationName: destinationName,
        tuljapur: tuljapur,
      });
      console.log('=== End Standardpu12 Parameters (BUS) ===');
      
      navigation.navigate("SelectDate", {
        cityName: packageData.city,
        cityId: selectedCityId,
        packageName: packageData.packageName,
        packageId: packageData.packageId,
        categoryName: selectedCategoryName,
        categoryId: packageData.categoryId,
        selectedPickupPoint: selectedPickupPoint,
        selectedPickupPointId: selectedPickupPointId,
        price: packageData.adultPrice,
        vehicleType: vehicleType,
        selectedVehicleId: selectedVehicleId,
        selectedBus: selectedBus,
        childWithSeatP: childWithSeatP,
        childWithoutSeatP: childWithoutSeatP,
        withoutBookingAmount: withoutBookingAmount,
        destinationId: destinationId,
        destinationName: destinationName,
        tuljapur: tuljapur,
      });
    } else if (!selectedBus) {
      console.log('=== Standardpu12 - Navigating to CarType (CAR) ===');
      console.log('All parameters being passed:', {
        cityName: packageData.city,
        cityId: selectedCityId,
        packageName: packageData.packageName,
        packageId: packageData.packageId,
        categoryName: selectedCategoryName,
        categoryId: packageData.categoryId,
        selectedPickupPoint: selectedPickupPoint,
        selectedPickupPointId: selectedPickupPointId,
        price: packageData.adultPrice,
        vehicleType: vehicleType,
        selectedVehicleId: selectedVehicleId,
        selectedBus: selectedBus,
        childWithSeatP: childWithSeatP,
        childWithoutSeatP: childWithoutSeatP,
        withoutBookingAmount: withoutBookingAmount,
        destinationId: destinationId,
        destinationName: destinationName,
        tuljapur: tuljapur,
        carType: route.params?.carType,
        carTotalSeat: carTotalSeat
      });
      console.log('=== End Standardpu12 Parameters (CAR) ===');
      
      navigation.navigate("CarType", {
        cityName: packageData.city,
        cityId: selectedCityId,
        packageName: packageData.packageName,
        packageId: packageData.packageId,
        categoryName: selectedCategoryName,
        categoryId: packageData.categoryId,
        selectedPickupPoint: selectedPickupPoint,
        selectedPickupPointId: selectedPickupPointId,
        price: price,
        vehicleType: vehicleType,
        selectedVehicleId: selectedVehicleId,
        selectedBus: selectedBus,
        childWithSeatP: childWithSeatP,
        childWithoutSeatP: childWithoutSeatP,
        withoutBookingAmount: withoutBookingAmount,
        destinationId: destinationId,
        destinationName: destinationName,
        tuljapur: tuljapur,
        carType: route.params?.carType,
        carTotalSeat: carTotalSeat
      });
    }
  };

  const handleSearch = (text) => {
    setSelectedPickupPoint(text);
    
    // For CAR or when selectedBus is false, use Google API search
    if (!selectedBus) {
      console.log('=== Using Google API search for pickup location ===');
      setShowDropdown(false);
      searchCities(text);
      return;
    }
    
    // For BUS or when selectedBus is true, use existing API filtering
    console.log('=== Using API filtering for pickup points ===');
    setShowPredictions(false);
    setPredictions([]);
    
    if (text.trim() === "") {
      setFilteredPickupPoints(pickupPoints);
      setShowDropdown(true); // Keep dropdown visible when empty for bus
    } else {
      const filtered = pickupPoints.filter(point =>
        point.pickupPointName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPickupPoints(filtered);
      setShowDropdown(true);
    }
  };

  // New logic to display routes based on the array structure
  const formatRouteText = (points) => {
    return points.map((point, index) => {
      const splitPoints = point.split(/[\|,]/).map((part, i) => (
        <Text key={i} style={styles.route}>
          {part.trim()}
        </Text>
      ));
      return (
        <View key={index}>
          {splitPoints}
        </View>
      );
    });
  };

  const searchCities = async (text) => {
    if (text.length >= 3) {
      try {
        // Search for any place
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_API_KEY}`
        );

        if (response.data.predictions) {
          // Get detailed place information for each prediction
          const detailedPredictions = await Promise.all(
            response.data.predictions.map(async (prediction) => {
              try {
                const detailsResponse = await axios.get(
                  `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=formatted_address,geometry,types&key=${GOOGLE_API_KEY}`
                );

                // Determine the type of place
                let placeType = 'location';
                if (prediction.types.includes('bus_station')) {
                  placeType = 'bus_stop';
                } else if (prediction.types.includes('locality') || prediction.types.includes('administrative_area_level_1')) {
                  placeType = 'city';
                }

                return {
                  ...prediction,
                  address: detailsResponse.data.result?.formatted_address || prediction.description,
                  type: placeType,
                  location: detailsResponse.data.result?.geometry?.location
                };
              } catch (error) {
                return {
                  ...prediction,
                  address: prediction.description,
                  type: 'location'
                };
              }
            })
          );

          setPredictions(detailedPredictions);
          setShowPredictions(true);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const handleCitySelect = (location) => {
    // For Google API results (CAR or selectedBus=false)
    if (location.description) {
      setSelectedPickupPoint(location.description);
      setSearchQuery(location.description);
      setShowPredictions(false);
      setPredictions([]);
      console.log('Selected pickup point from Google API:', location.description);
    } 
    // For API pickup points (BUS or selectedBus=true)
    else if (location.pickupPointName) {
      setSelectedPickupPoint(location.pickupPointName);
      setSelectedPickupPointId(location.pickupPointId);
      setSearchQuery(location.pickupPointName);
      setShowDropdown(false);
      console.log('Selected pickup point from API:', location.pickupPointName, 'ID:', location.pickupPointId);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView style={styles.container}>
        {/* Modern Header with Image Background */}
        <View style={styles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/back.png')}
            style={styles.headerBackground}
            imageStyle={styles.headerImageStyle}
          >
            <View style={styles.headerOverlay}>
              <Text style={styles.cityNameText}>
                {packageData ? packageData.city : 'Destination'}
              </Text>
            </View>
          </ImageBackground>
        </View>

        {packageData && (
          <>
            {/* Package Title Section */}
            <View style={styles.packageTitleSection}>
              <Text style={styles.packageTitle}>
                {packageData.packageName}
              </Text>
              <Text style={styles.packageSubtitle}>
                {packageData.category}
              </Text>
            </View>

            {/* Show loaded pickup points directly if selectedBus is true */}
            {selectedBus ? (
              <View style={styles.pickupPointsSection}>
                <Text style={styles.pickupPointsTitle}>Pickup Points</Text>
                {pickupPoints.length > 0 ? (
                  pickupPoints.map((point, idx) => (
                    <TouchableOpacity
                      key={point.pickupPointId || idx}
                      style={[
                        styles.pickupPointCard,
                        selectedPickupPointId === point.pickupPointId && styles.selectedPickupPointCard,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => {
                        setSelectedPickupPoint(point.pickupPointName);
                        setSelectedPickupPointId(point.pickupPointId);
                      }}
                    >
                      <View style={styles.pickupPointIconContainer}>
                        <Ionicons name="location-sharp" size={22} color={selectedPickupPointId === point.pickupPointId ? "#007aff" : "#ff6600"} />
                      </View>
                      <Text
                        style={[
                          styles.pickupPointText,
                          selectedPickupPointId === point.pickupPointId && styles.selectedPickupPointText,
                        ]}
                      >
                        {point.pickupPointName}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noLocationText}>No pickup points found</Text>
                )}
              </View>
            ) : (
              // Existing search section for when selectedBus is false
              <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                  <Ionicons name="location" size={24} color="#007aff" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={!selectedBus ? "Search for any pickup location..." : "Search pickup points..."}
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={(text) => {
                      setSearchQuery(text);
                      handleSearch(text);
                    }}
                  />
                </View>

                {/* Google API Predictions */}
                {showPredictions && predictions.length > 0 && (
                  <View style={styles.predictionsContainer}>
                    <ScrollView
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                      style={styles.predictionsScrollView}
                      contentContainerStyle={styles.predictionsScrollContent}
                      keyboardShouldPersistTaps="handled"
                    >
                      {predictions.map((prediction, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.predictionItem}
                          onPress={() => handleCitySelect(prediction)}
                        >
                          <View style={styles.predictionContent}>
                            <Ionicons
                              name={prediction.type === 'city' ? 'location' :
                                prediction.type === 'bus_stop' ? 'bus' : 'location-outline'}
                              size={20}
                              color="#007aff"
                              style={styles.predictionIcon}
                            />
                            <View style={styles.predictionTextContainer}>
                              <Text style={styles.predictionText}>{prediction.description}</Text>
                              <Text style={styles.predictionAddress}>{prediction.address}</Text>
                              <Text style={styles.predictionType}>
                                {prediction.type === 'city' ? 'City' :
                                  prediction.type === 'bus_stop' ? 'Bus Stop' : 'Location'}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* API Pickup Points Dropdown for BUS */}
                {(vehicleType === "BUS" || selectedBus) && showDropdown && filteredPickupPoints.length > 0 && (
                  <View style={styles.dropdown}>
                    <ScrollView
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                      style={{ maxHeight: 200 }}
                      keyboardShouldPersistTaps="handled"
                    >
                      {filteredPickupPoints.map((point, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => handleCitySelect(point)}
                        >
                          <Text style={styles.dropdownText}>{point.pickupPointName}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* No results message */}
                {(vehicleType === "BUS" || selectedBus) && searchQuery.trim() !== "" && filteredPickupPoints.length === 0 && !showPredictions && (
                  <Text style={styles.noLocationText}>No pickup points found</Text>
                )}
              </View>
            )}

            {/* Footer with Price and Book Button */}
            <View style={styles.footer}>
              <View style={styles.priceSection}>
                <Text style={styles.priceLabel}>Tour Cost</Text>
                <Text style={styles.priceValue}>₹{price}</Text>
              </View>
              <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
                <Text style={styles.bookButtonText}>Book Now</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#fff"
                  style={styles.bookButtonIcon}
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  headerContainer: {
    height: 280,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    marginBottom: 20,
  },
  headerBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImageStyle: {
    resizeMode: 'cover',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cityNameText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  packageTitleSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 6,
    borderLeftColor: '#FF5722',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  packageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  packageSubtitle: {
    fontSize: 16,
    color: '#FF5722',
    fontWeight: '600',
  },
  searchSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  predictionsContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 250,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  predictionItem: {
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  predictionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  predictionIcon: {
    marginRight: 12,
  },
  predictionTextContainer: {
    flexShrink: 1,
  },
  predictionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  predictionAddress: {
    fontSize: 13,
    color: '#666',
  },
  predictionType: {
    fontSize: 12,
    color: '#007aff',
    fontStyle: 'italic',
    marginTop: 3,
  },
  dropdown: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 6,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  noLocationText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 16,
    color: '#888',
  },
  priceValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 4,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bookButtonIcon: {
    marginLeft: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    fontWeight: '600',
    textAlign: 'center',
  },
  pickupPointsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  pickupPointsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  pickupPointCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedPickupPointCard: {
    borderColor: '#007aff',
    backgroundColor: '#e6f2ff',
    shadowOpacity: 0.15,
  },
  pickupPointIconContainer: {
    marginRight: 14,
    backgroundColor: '#f7f7f7',
    borderRadius: 20,
    padding: 6,
  },
  pickupPointText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedPickupPointText: {
    color: '#007aff',
    fontWeight: 'bold',
  },
});


export default PackageDetails;
