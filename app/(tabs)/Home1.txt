import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, BackHandler } from "react-native";
import { Svg, Path } from "react-native-svg";
import { useNavigation, useRoute } from "@react-navigation/native"; // Importing useRoute to access route params
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

const Home = () => {
    const navigation = useNavigation();
    const route = useRoute(); // Accessing route params
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vehicleType, setVehicleType] = useState(null); // State to store the vehicle type
    const [selectedCity, setSelectedCity] = useState({ cityId: null, cityName: null }); // State for selected city

    // Fetch the vehicleType from AsyncStorage
    useEffect(() => {
        const fetchVehicleType = async () => {
            try {
                const storedVehicleType = await AsyncStorage.getItem("vehicleType");
                if (storedVehicleType) {
                    setVehicleType(storedVehicleType); // Set the vehicleType state from AsyncStorage
                }
            } catch (error) {
                console.error("Error fetching vehicle type from storage:", error);
            }
        };

        fetchVehicleType(); // Call function to fetch vehicle type
    }, []); // Only run this once when the component mounts

    // Fetch cities
    useEffect(() => {
        fetch("http://ashtavinayak.somee.com/api/City/")
            .then((response) => response.json())
            .then((data) => {
                setCities(data);
                setLoading(false); // Set loading to false after data is fetched
            })
            .catch((error) => {
                console.error("Error fetching cities:", error);
                setLoading(false); // Set loading to false even in case of an error
            });
    }, []);

    // Handle physical back button press to reset navigation stack
    useEffect(() => {
        const backAction = () => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'SelectVehicle1' }],
            });
            return true;  // Prevent default back action
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    // Store selected city to AsyncStorage
    const storeCityData = async (cityId, cityName) => {
        try {
            await AsyncStorage.setItem("selectedCityId", cityId.toString());
            await AsyncStorage.setItem("selectedCityName", cityName);
        } catch (error) {
            console.error("Error storing city data:", error);
        }
    };

    // Handle city selection
    const handlePress = async (cityId, cityName) => {
        console.log("Selected City ID:", cityId);
        console.log("Selected City Name:", cityName);
        console.log("Selected Vehicle Type:", vehicleType); // Log the vehicleType

        // Store city info to AsyncStorage
        await storeCityData(cityId, cityName);

        // Navigate to the next page and pass city information and vehicleType
        navigation.navigate("SelectTour", {
            selectedCityId: cityId,
            selectedCityName: cityName,
            vehicleType: vehicleType, // Pass the vehicleType to the next screen
        });

        // Update the local state for selected city
        setSelectedCity({ cityId, cityName });
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.welcomeText}>“ Welcome Back Ganesh !! ”</Text>
                <Text style={styles.subText}>Where You Want to go ?</Text>
            </View>

            {/* Illustration */}
            <View style={styles.citySelection}>
                <View style={styles.illustrationContainer}>
                    <Svg width="100%" height="100" viewBox="0 0 200 100">
                        <Path stroke="#E0E0E0" fill="transparent" strokeWidth="2" />
                    </Svg>
                    <Image source={require("../../assets/images/bus1.png")} style={styles.illustration} />
                </View>

                {/* Start City Buttons */}
                <Text style={styles.cityLabel}>Select Start City</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#FF5722" />
                ) : (
                    cities.map((city) => (
                        <TouchableOpacity
                            key={city.cityId}
                            style={styles.cityButton}
                            onPress={() => handlePress(city.cityId, city.cityName)}  // Pass both cityId and cityName
                        >
                            <Text style={styles.cityText}>{city.cityName}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </View>

           
              
             
  
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        marginTop: 40,
    },
    header: {
        padding: 20,
        paddingTop: 40,
        height: 200,
        alignItems: "center",
        backgroundColor: "#FF5722",
        position: "relative",
        zIndex: 1,
        marginBottom: 10,
    },
    welcomeText: {
        fontSize: 38,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
    },
    subText: {
        fontSize: 16,
        color: "#fff",
        marginTop: 10,
        textAlign: "center",
        marginBottom: 50,
    },
    illustrationContainer: {
        alignItems: "center",
        marginTop: -80,
        zIndex: 2,
    },
    illustration: {
        width: 250,
        height: 120,
        resizeMode: "contain",
    },
    citySelection: {
        alignItems: "center",
        marginTop: 60,
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 4,
        width: "80%",
        alignSelf: "center",
        zIndex: 2,
    },
    cityLabel: {
        fontSize: 16,
        color: "#555",
        marginBottom: 15,
    },
    cityButton: {
        backgroundColor: "#FFCCBC",
        paddingVertical: 10,
        width: 150,
        borderRadius: 12,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 4,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    cityText: {
        fontSize: 18,
        color: "#D84315",
        fontWeight: "bold",
        textAlign: "center",
    },
    journeyContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    detailsText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 7,
    },
    journeyCard: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 5,
    },
    journeyRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    icon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#E0E0E0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    arrow: {
        fontSize: 16,
        fontWeight: "bold",
    },
    journeyInfo: {
        flex: 1,
    },
    journeyLabel: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 3,
    },
    journeyText: {
        fontSize: 12,
        color: "#555",
    },
    timeText: {
        textAlign: "right",
        fontSize: 12,
        color: "#666",
    },
    separator: {
        height: 1,
        backgroundColor: "#E0E0E0",
        marginVertical: 10,
    },
});

export default Home;
