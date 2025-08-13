import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Platform,
  useWindowDimensions,
  ImageBackground,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect, CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import LottieView from "lottie-react-native";
import Icon from 'react-native-vector-icons/Ionicons';


const { width, height } = Dimensions.get("window");

const Home = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { width: screenWidth } = useWindowDimensions();

  const [cities, setCities] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleType, setVehicleType] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState();
  const [selectedDestination, setSelectedDestination] = useState();
  const userName = route.params?.userName || "";
  const selectedVehicleId = route.params?.selectedVehicleId;
  const selectedBus = route.params?.selectedBus;

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        
        // Get authorization token from AsyncStorage
        let authToken = null;
        try {
          authToken = await AsyncStorage.getItem("token");
          console.log("Auth token retrieved:", authToken ? authToken : "No token found");
        } catch (err) {
          console.error("Error retrieving auth token:", err);
        }
        
        // Fetch cities with authorization header
        const fetchCities = fetch("https://ashtavinayak.itastourism.com/api/City/", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          }
        })
          .then((res) => {
            console.log("Cities API response status:", res.status);
            
            // Handle 401 Unauthorized error
            if (res.status === 401) {
              console.log("Cities API returned 401 - Unauthorized. Navigating to Login.");
              // Clear stored authentication data
              AsyncStorage.multiRemove(["token", "mobileNo", "user"]).catch(err => {
                console.error("Error clearing auth data:", err);
              });
              
              // Navigate to Login and reset navigation stack
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                })
              );
              throw new Error("Unauthorized - Redirecting to Login");
            }
            
            if (!res.ok) {
              throw new Error(`Cities API failed with status: ${res.status}`);
            }
            return res.text().then(text => {
              console.log("Cities API raw response:", text);
              if (!text) {
                console.log("Cities API returned empty response");
                return [];
              }
              try {
                return JSON.parse(text);
              } catch (e) {
                console.error("Cities API JSON parse error:", e);
                return [];
              }
            });
          })
          .catch((err) => {
            console.error("Error fetching cities:", err);
            // Don't return empty array for 401 errors as we're navigating away
            if (err.message.includes("Unauthorized")) {
              return null; // This will be handled in the Promise.all
            }
            return [];
          });

        // Fetch destinations with authorization header
        const fetchDestinations = fetch("https://ashtavinayak.itastourism.com/api/TourDestinationApi/GetTourDestinationList", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          }
        })
          .then((res) => {
            console.log("Destinations API response status:", res.status);
            
            // Handle 401 Unauthorized error
            if (res.status === 401) {
              console.log("Destinations API returned 401 - Unauthorized. Navigating to Login.");
              // Clear stored authentication data
              AsyncStorage.multiRemove(["token", "mobileNo", "user"]).catch(err => {
                console.error("Error clearing auth data:", err);
              });
              
              // Navigate to Login and reset navigation stack
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                })
              );
              throw new Error("Unauthorized - Redirecting to Login");
            }
            
            if (!res.ok) {
              throw new Error(`Destinations API failed with status: ${res.status}`);
            }
            return res.text().then(text => {
              console.log("Destinations API raw response:", text);
              if (!text) {
                console.log("Destinations API returned empty response");
                return [];
              }
              try {
                return JSON.parse(text);
              } catch (e) {
                console.error("Destinations API JSON parse error:", e);
                return [];
              }
            });
          })
          .catch((err) => {
            console.error("Error fetching destinations:", err);
            // Don't return empty array for 401 errors as we're navigating away
            if (err.message.includes("Unauthorized")) {
              return null; // This will be handled in the Promise.all
            }
            return [];
          });

        // Wait for both API calls to complete
        Promise.all([fetchCities, fetchDestinations])
          .then(([citiesData, destinationsData]) => {
            console.log("Final cities data:", citiesData);
            console.log("Final destinations data:", destinationsData);
            
            // Check if either API returned null (401 error occurred)
            if (citiesData === null || destinationsData === null) {
              console.log("One of the APIs returned null due to 401 error - navigation already handled");
              return; // Don't update state as we're navigating away
            }
            
            setCities(citiesData || []);
            setDestinations(destinationsData || []);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Error fetching data:", err);
            // Don't set loading to false if it's a 401 error as we're navigating away
            if (!err.message.includes("Unauthorized")) {
              setLoading(false);
            }
          });
      };

      fetchData();

      return () => {
        setSelectedCityId(undefined);
        setSelectedDestination(undefined);
      };
    }, [])
  );

  useEffect(() => {
    const fetchVehicleType = async () => {
      try {
        const storedType = await AsyncStorage.getItem("vehicleType");
        if (storedType) setVehicleType(storedType);
      } catch (err) {
        console.error("Error fetching vehicle type:", err);
      }
    };
    fetchVehicleType();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        navigation.reset({
          index: 0,
          routes: [{ name: "SelectVehicle1" }],
        });
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [navigation])
  );

  const storeCityData = async (cityId, cityName) => {
    try {
      await AsyncStorage.setItem("selectedCityId", cityId.toString());
      await AsyncStorage.setItem("selectedCityName", cityName);
    } catch (err) {
      console.error("Error storing city data:", err);
    }
  };

  const handlePress = async (cityId, cityName, destinationId, destinationName) => {
    await storeCityData(cityId, cityName);
    const isTuljapur = destinationName.toLowerCase() === "tuljapur";
    navigation.navigate("SelectTour1", {
      selectedCityId: cityId,
      selectedCityName: cityName,
      destinationId: destinationId,
      destinationName: destinationName,
      vehicleType,
      selectedVehicleId,
      selectedBus,
      userName,
      tuljapur: isTuljapur,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.lottieWrapper}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.navigate("SelectVehicle1")}
        >
          <Icon name="chevron-back" size={28} color="#FF5722" />
        </TouchableOpacity>

        <LottieView
          source={require("../../assets/travelanimation.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>


      <Text style={styles.welcomeText}>Welcome {userName}!</Text>

      <View style={styles.citySelection}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF5722" />
        ) : (
          <>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Select Start City</Text>
              <Picker
                selectedValue={selectedCityId}
                style={styles.picker}
                onValueChange={(val) => setSelectedCityId(val)}
                dropdownIconColor="#FF5722"
              >
                <Picker.Item label="Select a city..." value={undefined} />
                {cities.map((city) => (
                  <Picker.Item key={city.cityId} label={city.cityName} value={city.cityId} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Select Destination</Text>
              <Picker
                selectedValue={selectedDestination}
                style={styles.picker}
                onValueChange={(val) => setSelectedDestination(val)}
                dropdownIconColor="#FF5722"
              >
                <Picker.Item label="Select a destination..." value={undefined} />
                {destinations.map((destination) => (
                  <Picker.Item 
                    key={destination.id} 
                    label={destination.destinationName} 
                    value={destination.id} 
                  />
                ))}
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => {
                if (!selectedCityId || !selectedDestination) {
                  alert("Please select both a city and a destination.");
                  return;
                }
                const city = cities.find((c) => c.cityId === selectedCityId);
                const destination = destinations.find((d) => d.id === selectedDestination);
                handlePress(city.cityId, city.cityName, destination.id, destination.destinationName);
              }}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? height * 0.05 : height * 0.04,
  },
  background: {
    flex: 1,
  },
  lottieWrapper: {
    marginTop: 20,
    alignItems: "center",
  },
  lottie: {
    width: 160,
    height: 160,
  },
  backIcon: {
    position: "absolute",
    top: 0,
    left: 0,
    padding: 10,
    zIndex: 10,
  },

  welcomeText: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    color: "#FF5722",
    textAlign: "center",
    marginVertical: 10,
  },
  citySelection: {
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 18,
    elevation: 2,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF5722",
    marginBottom: 6,
  },
  picker: {
    width: "100%",
    color: "#333",
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
  },
  nextButton: {
    backgroundColor: "#FF5722",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Home;
