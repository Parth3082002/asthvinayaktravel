import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, StyleSheet, 
  ScrollView, Image, ImageBackground, TextInput, TouchableOpacity, TouchableWithoutFeedback,Keyboard
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
  const navigation = useNavigation();

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
  
      // Set the fetched data along with categoryId
      setPackageData({ ...data, categoryId: fetchedCategoryId });
    } catch (error) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBookNow = () => {
    // Check if the pickup location is selected
    if (!selectedPickupPoint.trim()) {
      // Show an alert if no pickup location is selected
      alert("Please select a pickup location first");
      return; // Prevent navigation if no pickup location is selected
    }
  
    // Log all parameters to the console
    console.log("Navigating to Select Date with the following parameters:");
    console.log("City Name:", packageData.city);
    console.log("City ID:", cityId);
    console.log("Package Name:", packageData.packageName);
    console.log("Package ID:", packageData.packageId);
    console.log("Category Name:", packageData.category);
    console.log("Category ID:", packageData.categoryId);
    console.log("Selected Pickup Point:", selectedPickupPoint);
    console.log("Price:", packageData.price);
  
    // Navigate to the "Select Date" page, passing all required parameters
    navigation.navigate("SelectDate", {
      cityName: packageData.city,
      cityId: cityId,
      packageName: packageData.packageName,
      packageId: packageData.packageId,
      categoryName: packageData.category,
      categoryId: packageData.categoryId, // Ensure the correct categoryId is passed
      selectedPickupPoint: selectedPickupPoint,
      price: packageData.price,
    });
  };
   

  const fetchPickupPoints = async (cityId) => {
    try {
      const apiUrl = `http://ashtavinayak.somee.com/api/Pickup/City/${cityId}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch pickup points');
      }

      const data = await response.json();
      setPickupPoints(data.data || []);
      setFilteredPickupPoints(data.data || []);  // Set the filtered points initially
    } catch (error) {
      setError("Failed to fetch pickup points");
    }
  };

  const handleSearch = (text) => {
    setSelectedPickupPoint(text);
    if (text.trim() === "") {
      setFilteredPickupPoints(pickupPoints); // Show all if search box is empty
    } else {
      const filtered = pickupPoints.filter(point =>
        point.pickupPointName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPickupPoints(filtered); // Show filtered points
    }
  };

  const groupRoutesByDay = (routes) => {
    if (!routes || routes.length === 0) return [];

    const groupedRoutes = {};
    routes.forEach((route) => {
      const day = route.day || "Day1"; // Default to "Day1" if no day is specified
      if (!groupedRoutes[day]) {
        groupedRoutes[day] = [];
      }
      groupedRoutes[day].push(route);
    });

    return groupedRoutes;
  };

  const groupSubRoutes = (dayRoutes) => {
    const mainRoutes = [];
    const subRoutes = {};

    dayRoutes.forEach((route) => {
      if (route.parentId === null) {
        mainRoutes.push(route);
      } else {
        if (!subRoutes[route.parentId]) {
          subRoutes[route.parentId] = [];
        }
        subRoutes[route.parentId].push(route);
      }
    });

    return { mainRoutes, subRoutes };
  };

  const handleDropdownClick = (point) => {
    setSelectedPickupPoint(point.pickupPointName);
    setShowDropdown(false);
  };

  const handleOutsidePress = () => {
    setShowDropdown(false); // Hide the dropdown when clicking outside
    Keyboard.dismiss(); // Dismiss the keyboard (if applicable)
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading package details...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
       
    {/* Your existing ScrollView and content */}
  
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
            <Text style={styles.errorText}>No package details available.</Text>
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
                      editable={false} // Disable keyboard on click
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
                          onPress={() => handleDropdownClick(point)}
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
                {Object.keys(groupRoutesByDay(packageData.routes)).map((day) => {
                  const { mainRoutes, subRoutes } = groupSubRoutes(groupRoutesByDay(packageData.routes)[day]);

                  return (
                    <View key={day} style={styles.container1}>
                <Text style={styles.dayText}>{`${day}`}</Text>
                <View style={styles.itineraryRow}>
                  <Image
                    source={images[parseInt(day.replace("Day", ""), 10) - 1]}
                    style={styles.dayImage}
                  />
                  <View style={styles.routeContainer}>
                  <Svg height="100%" width="10">
  {mainRoutes.map((route, index) => {
    const subRouteCount = subRoutes[route.trid]?.length || 0;
    const sectionHeight = subRouteCount > 0 ? 40 + subRouteCount * 20 : 40;
    const startY = index === 0 ? 0 : mainRoutes.slice(0, index).reduce((acc, r) => {
      const subHeight = subRoutes[r.trid]?.length || 0;
      return acc + (subHeight > 0 ? 40 + subHeight * 20 : 40);
    }, 0);
    const dots = Math.floor(sectionHeight / 10); // Ensure even spacing

    return (
      <React.Fragment key={route.trid}>
        {/* Full start dot */}
        <Circle cx="5" cy={startY} r="2.5" fill="blue" />
        {/* Consistent dotted line */}
        {Array.from({ length: dots }).map((_, dotIndex) => (
          <Circle
            key={dotIndex}
            cx="5"
            cy={startY + dotIndex * 10}
            r="2.5"
            fill="blue"
          />
        ))}
      </React.Fragment>
    );
  })}
</Svg>

                    <View>
                      {mainRoutes.map((route, index) => {
                        const subRouteCount = subRoutes[route.trid]?.length || 0;
                        const sectionHeight = subRouteCount > 0 ? 25 + subRouteCount * 20 : 25;

                        return (
                          <View key={route.trid} style={{ height: sectionHeight, justifyContent: "center" }}>
                            <Text style={styles.route}>{route.pointName}</Text>
                            {subRoutes[route.trid] &&
                              subRoutes[route.trid].map((subRoute) => (
                                <Text key={subRoute.trid} style={styles.subRoute}>
                                  {subRoute.pointName}
                                </Text>
                              ))}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>  );
                })}
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
  noLocationText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    padding: 10,
  },
  headerContent: {
    padding: 38,
    width: '100%',
    marginTop: -100,
  },
  inclusionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  inclusionText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  cityText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 10,
  },
  inclusionDetailsContainer: {
    marginTop: 10,
    marginLeft: 10,
  },
  inclusionDetails: {
    fontSize: 16.5,
    color: '#fff',
    textAlign: 'left',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontWeight:'bold',
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 2,
  },
  searchInput: {
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },
  dropdown: {
    maxHeight: 200,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    position: 'absolute',
    width: '100%',
    top: 107,
    left:15,
    zIndex: 999, // Ensure dropdown is on top
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  dropdownText: {
    fontSize: 16,
  },
 
  dayContainer: {
    padding: 20,
  },
  dayText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -20,
    color: 'rgba(0, 122, 211, 1)',
    marginBottom:-20,
  },
  itineraryRow: {
    flexDirection: 'row',
    marginVertical: 30,
  },
  dayImage: {
    width: 135,
    height: 215,
    marginRight: 20,
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  route: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  subRoute: {
    fontSize: 14,
    marginLeft: 10,
    color: "gray",
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginTop: -20,
    borderTopWidth:1,
    borderColor:'#ccc'
  },
  costText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 22,
    fontWeight: 'bold',
    left:7,
    color: 'rgba(0, 227, 9, 1)',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff5722',
    padding: 10,
    borderRadius: 5,
  },
  bookButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default PackageDetails;
