import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, StyleSheet, 
  ScrollView, Image, ImageBackground, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, BackHandler,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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
  const { selectedCategory, selectedPackage, cityId, cityName } = route.params || {};
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

  const { vehicleType, categoryName, packageName, childWithSeatP, childWithoutSeatP } = route.params || {}; 

  useEffect(() => {
    const backAction = () => {
        // Reset navigation stack and navigate back to Home
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
        return true;  // Prevent default back action
    };

    // Add event listener for physical back button
    const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
    );

    // Clean up the event listener on component unmount
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    if (cityId && selectedCategory && selectedPackage && cityName) {
      fetchPackageDetails(cityId, selectedCategory, selectedPackage);
      fetchPickupPoints(cityId);  // Fetch pickup points
    } else {
      setLoading(false);
      setError("Invalid parameters received");
    }
  }, [cityId, selectedCategory, selectedPackage, cityName]);

  const images = [Day1, Day2, Day3, Day4, Day5]; // Array of images

  const fetchPackageDetails = async (cityId, categoryId, packageId) => {
    try {
      setLoading(true);
      setError(null);
      const encodedPackageId = encodeURIComponent(packageId);
      const apiUrl = `http://ashtavinayak.somee.com/api/Package/GetPackagePrice/${cityId}/${categoryId}/${encodedPackageId}`;
  
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
    try {
      const apiUrl = `http://ashtavinayak.somee.com/api/Pickup/City/${cityId}`;
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
      } else {
        setPickupPoints([]);
        setFilteredPickupPoints([]);
      }
    } catch (error) {
      setError("Failed to fetch pickup points");
    }
  };

  const handleBookNow = () => {
    if (!selectedPickupPoint.trim()) {
      alert("Please select a pickup location first");
      return; 
    }


    console.log("City Name:", packageData.city);
console.log("City ID:", cityId);
console.log("Package Name:", packageData.packageName);
console.log("Package ID:", packageData.packageId);
console.log("Category Name:", packageData.categoryName);
console.log("Category ID:", packageData.categoryId);
console.log("Selected Pickup Point:", selectedPickupPoint);
console.log("Selected Pickup Point ID:", selectedPickupPointId);
console.log("Price:", packageData.price);
console.log("Vehicle Type:", vehicleType);
console.log("Child With Seat Price:", childWithSeatP);
console.log("Child Without Seat Price:", childWithoutSeatP);


    console.log("Category Name:", categoryName);
    console.log("Package Name:", packageName);
    console.log("Child with Seat Price:", childWithSeatP);
    console.log("Child without Seat Price:", childWithoutSeatP);

    if (vehicleType === "BUS") {
      navigation.navigate("SelectDate", {
        cityName: packageData.city,
        cityId: cityId,
        packageName: packageData.packageName,
        packageId: packageData.packageId,
        categoryName: categoryName,
        categoryId: packageData.categoryId, 
        selectedPickupPoint: selectedPickupPoint,
        selectedPickupPointId: selectedPickupPointId,  
        price: packageData.price,
        vehicleType: vehicleType,
        childWithSeatP: childWithSeatP,
        childWithoutSeatP: childWithoutSeatP,
      });
    } else if (vehicleType === "car") {
      navigation.navigate("CarType", {
        cityName: packageData.city,
        cityId: cityId,
        packageName: packageData.packageName,
        packageId: packageData.packageId,
        categoryName: categoryName,
        categoryId: packageData.categoryId, 
        selectedPickupPoint: selectedPickupPoint,
        selectedPickupPointId: selectedPickupPointId,  
        price: packageData.price,
        vehicleType: vehicleType,
        childWithSeatP: childWithSeatP,
        childWithoutSeatP: childWithoutSeatP,
      });
    }
  };

  const handleSearch = (text) => {
    setSelectedPickupPoint(text);
    if (text.trim() === "") {
      setFilteredPickupPoints(pickupPoints);
    } else {
      const filtered = pickupPoints.filter(point =>
        point.pickupPointName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPickupPoints(filtered);
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
        <ImageBackground
          source={require('../../assets/images/back.png')}
          style={styles.headerImage}
        >
          {packageData ? (
            <View style={styles.headerContent}>
              <View style={styles.inclusionRow}>
                <Text style={styles.inclusionText}>Inclusion:</Text>
                <Text style={styles.cityText}>{packageData.city}</Text>
              </View>

              <View style={styles.inclusionDetailsContainer}>
                {packageData.inclusions.split(',').map((item, index) => (
                  <Text key={index} style={styles.inclusionDetails}>
                    • {item.trim()}
                  </Text>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.errorText}>No trip available for this package!</Text>
          )}
        </ImageBackground>

        {packageData && (
          <>
            <View style={{ flex: 1 }}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>
                  {packageData.packageName} ({packageData.category})
                </Text>

                <TouchableWithoutFeedback onPress={() => setShowDropdown(true)}>
                  <View style={styles.searchBox}>
                    <Ionicons name="location" size={23} color="#ff5722" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Select Pickup Location"
                      placeholderTextColor="#888"
                      value={selectedPickupPoint}
                      editable={false}
                    />
                  </View>
                </TouchableWithoutFeedback>

                {showDropdown && (
                  <View style={styles.dropdown}>
                    {filteredPickupPoints.length > 0 ? (
                      filteredPickupPoints.map((point, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedPickupPoint(point.pickupPointName);
                            setSelectedPickupPointId(point.pickupPointID);
                            setShowDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownText}>{point.pickupPointName}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.noLocationText}>No location available</Text>
                    )}
                  </View>
                )}
              </View>

              <View style={styles.dayContainer}>
                {packageData.routes?.map((route, dayIndex) => (
                  <View key={dayIndex} style={styles.container1}>
                    <Text style={styles.dayText}>{route.day}</Text>
                    <View style={styles.itineraryRow}>
                      <Image
                        source={images[parseInt(route.day.replace("Day", ""), 10) - 1]}
                        style={styles.dayImage}
                      />
                      <View style={styles.routeContainer}>
                        <ScrollView
                          style={{ maxHeight: 220 }}
                          contentContainerStyle={{ flexGrow: 1 }}
                          showsVerticalScrollIndicator={true}
                          nestedScrollEnabled={true}
                        >
                          {formatRouteText(route.points || [])} {/* Check for points */}
                        </ScrollView>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.footer}>
                <View>
                  <Text style={styles.costText}>Tour Cost</Text>
                  <Text style={styles.priceText}>₹{packageData.price}</Text>
                </View>
                <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
                  <Text style={styles.bookButtonText}>Book Now</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#fff"
                    style={{ marginLeft: 10 }}
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
  container: { flex: 1, padding: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerImage: { height: 200, justifyContent: 'flex-end', paddingLeft: 15 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  inclusionRow: { flexDirection: 'row' },
  inclusionText: { fontSize: 18, fontWeight: 'bold' },
  cityText: { fontSize: 18, fontWeight: 'bold', color: '#ff5722' },
  inclusionDetailsContainer: { marginVertical: 10 },
  inclusionDetails: { fontSize: 16 },
  errorText: { fontSize: 16, color: 'red' },
  titleContainer: { marginVertical: 15 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 10, paddingLeft: 10 },
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 1,
  },
  dropdownItem: { padding: 10 },
  dropdownText: { fontSize: 16 },
  noLocationText: { padding: 10, color: '#888' },
  dayContainer: { flex: 1, marginVertical: 15 },
  dayText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  itineraryRow: { flexDirection: 'row', marginBottom: 15 },
  dayImage: { width: 60, height: 60, marginRight: 10 },
  routeContainer: { flex: 1 },
  route: { fontSize: 16, marginBottom: 5 },
  bookNowButton: {
    backgroundColor: '#ff5722',
    paddingVertical: 15,
    marginBottom: 15,
    borderRadius: 5,
  },
  bookNowText: { color: 'white', textAlign: 'center', fontSize: 18 },
});

export default PackageDetails;
