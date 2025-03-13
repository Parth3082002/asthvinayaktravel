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
            routes: [{ name: 'SelectVehicle1' }],
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
      const apiUrl = `https://ashtavinayak.somee.com/api/Package/GetPackagePrice/${cityId}/${categoryId}/${encodedPackageId}`;
  
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
      const apiUrl = `https://ashtavinayak.somee.com/api/Pickup/City/${cityId}`;
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


    const price = packageData.adultPrice;

//     console.log("City Name:", packageData.city);
// console.log("City ID:", cityId);
// console.log("Package Name:", packageData.packageName);
// console.log("Package ID:", packageData.packageId);
// console.log("Category Name:", packageData.categoryName);
// console.log("Category ID:", packageData.categoryId);
// console.log("Selected Pickup Point:", selectedPickupPoint);
// console.log("Selected Pickup Point ID:", selectedPickupPointId);
console.log("Price:", packageData.adultPrice);
// console.log("Vehicle Type:", vehicleType);
// console.log("Child With Seat Price:", childWithSeatP);
// console.log("Child Without Seat Price:", childWithoutSeatP);


//     console.log("Category Name:", categoryName);
//     console.log("Package Name:", packageName);
//     console.log("Child with Seat Price:", childWithSeatP);
//     console.log("Child without Seat Price:", childWithoutSeatP);

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
        price: packageData.adultPrice,
        vehicleType: vehicleType,
        childWithSeatP: childWithSeatP,
        childWithoutSeatP: childWithoutSeatP,
      });
    } else if (vehicleType === "CAR") {
      navigation.navigate("CarType", {
        cityName: packageData.city,
        cityId: cityId,
        packageName: packageData.packageName,
        packageId: packageData.packageId,
        categoryName: categoryName,
        categoryId: packageData.categoryId, 
        selectedPickupPoint: selectedPickupPoint,
        selectedPickupPointId: selectedPickupPointId,  
        price: packageData.adultPrice,
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
      {/* City Name Positioned at the Top Right Corner */}
      <Text style={styles.cityText}>{packageData.city}</Text>

      {/* Inclusion Section on the Left */}
      <View style={styles.inclusionContent}>
        <Text style={styles.inclusionText}>Inclusion:</Text>
        <View style={styles.inclusionDetailsContainer}>
          {packageData.inclusions.split(',').map((item, index) => (
            <Text key={index} style={styles.inclusionDetails}>
              • {item.trim()}
            </Text>
          ))}
        </View>
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
        {/* Image */}
        <Image
          source={images[parseInt(route.day.replace("Day", ""), 10) - 1]}
          style={styles.dayImage}
        />

        {/* Scrollable Timeline */}
        <View style={styles.routeContainer}>
          <ScrollView
            style={styles.scrollContainer}
            nestedScrollEnabled
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.timelineContainer}>
              {route.points
                ?.join(",") // Convert array to string
                .split(/,|\|/) // Split on comma or pipe
                .map((location, index, arr) => (
                  <View key={index} style={styles.timelineRow}>
                    {/* Vertical Line & Dot */}
                    <View style={styles.verticalLineContainer}>
                      {/* Line before dot (except for the first one) */}
                      {index !== 0 && <View style={styles.line} />}
                      <View style={styles.dot} />
                      {/* Line after dot (ALWAYS present) */}
                      <View style={styles.line} />
                    </View>
                    {/* Location Text */}
                    <Text style={styles.timelineText}>{location.trim()}</Text>
                  </View>
                ))}
            </View>
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
                  <Text style={styles.priceText}>₹{packageData.adultPrice}</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerImage: {
    width: '100%',
    height: 230,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  
  headerContent: {
    width: '100%',
    paddingHorizontal: 20,  // Keep padding for better spacing
    justifyContent: 'center',
  },
  
  /* City name at the top-right corner */
  cityText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    position: 'absolute',
    top: -40,
    right: 20,
  },
  
  /* Keep all inclusions on the left */
  inclusionContent: {
    alignSelf: 'flex-start',  // Align to the left
    width: '80%',
    top: -30,  // Limit width so it doesn’t take full space
  },
  
  inclusionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  
  inclusionDetailsContainer: {
    marginTop: 5,
  },
  
  inclusionDetails: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'left',
    fontWeight: 'bold',
  },
  
  titleContainer: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
 
  dayContainer: {
    padding: 20,
    marginTop:-20,
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color:'rgba(0, 122, 211, 1)',
  },
  itineraryRow: {
    flexDirection: 'row',
    marginVertical: 30,
  },
  dayImage: {
    width: 135,
    height: 215,
    // borderRadius: 10?,
    marginRight: 20,
    borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  marginVertical:-15,
  },
  
  verticalLine: {
    position: 'relative',
    width: 2,
    backgroundColor: '#ccc', // Vertical line color
    marginRight: 20,
    alignItems: 'center',
  },
  
  timeline: {
    justifyContent: 'flex-start',
  },
  timelineText: {
    fontSize: 16,
    color: '#555', // Text color
    marginBottom: 20, // Space between text and dots
    // marginTop:20,
    
  },
  nightText: {
    fontSize: 16,
    // fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -5,

    color: '#555',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginTop:-40,
    // borderTopWidth: 1,
    // borderColor: '#ddd',
  },
  costText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft:5,
  },
  priceText: {
    fontSize: 18,
    color: 'rgba(0, 227, 9, 1)',
    fontWeight: 'bold',
    marginLeft:5,
  },
  bookButton: {
    backgroundColor: '#ff5722',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row', // This makes the text and icon align horizontally
    alignItems: 'center',  // Vertically centers the text and the icon
    justifyContent: 'center', // Centers the content
  },  
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 0,  // Adds space between text and the arrow
    marginLeft:10,
    
  },


 

  scrollContainer: {
    maxHeight: 200, // Enable scrolling when needed
    paddingVertical: 5,
    paddingRight: 10, // Creates space between content and scrollbar
  },
  timelineContainer: {
    flexDirection: "column", // Stack locations vertically
    marginLeft: 10,
  },
  timelineRow: {
    flexDirection: "row", // Row for dot + line + text
    alignItems: "center",
    marginBottom: 10,
  },
  verticalLineContainer: {
    alignItems: "center",
    marginRight: 15, // More gap between dots and text
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: "#007bff",
  },
  line: {
    width: 2,
    height: 10, // Adjust line height for spacing
    backgroundColor: "#ccc",
  },
  timelineText: {
    fontSize: 14,
    marginLeft: 5, // More gap between dots/lines and text
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  noLocationText: {
    padding: 10,
    fontSize: 14,
    textAlign: "center",
    color: "#888",
  },
  dropdownContainer: {
    position: "relative",
    width: "100%",
  },
  dropdown: {
    position: "absolute",
    top: "115%",

    left: 15,
    right: 15,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1000,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 7,
  },
  searchInput: {
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },
});


export default PackageDetails;
