import React, { useEffect, useState } from "react";
import { 
    View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, 
    ActivityIndicator, BackHandler, Dimensions, Platform, useWindowDimensions 
} from "react-native";
import { Svg, Path } from "react-native-svg";
import { useNavigation, useRoute } from "@react-navigation/native"; 
import AsyncStorage from "@react-native-async-storage/async-storage"; 

const { width, height } = Dimensions.get("window"); // Get screen width and height


const Home = () => {
    const navigation = useNavigation();
    const route = useRoute(); 
    const { width: screenWidth } = useWindowDimensions(); // Get dynamic screen width
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vehicleType, setVehicleType] = useState(null); 
    const [selectedCity, setSelectedCity] = useState({ cityId: null, cityName: null });

    useEffect(() => {
        const fetchVehicleType = async () => {
            try {
                const storedVehicleType = await AsyncStorage.getItem("vehicleType");
                if (storedVehicleType) {
                    setVehicleType(storedVehicleType);
                }
            } catch (error) {
                console.error("Error fetching vehicle type from storage:", error);
            }
        };

        fetchVehicleType();
    }, []);

    useEffect(() => {
        fetch("http://ashtavinayak.somee.com/api/City/")
            .then((response) => response.json())
            .then((data) => {
                setCities(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching cities:", error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const backAction = () => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'SelectVehicle1' }],
            });
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);


    const storeCityData = async (cityId, cityName) => {
        try {
            await AsyncStorage.setItem("selectedCityId", cityId.toString());
            await AsyncStorage.setItem("selectedCityName", cityName);
        } catch (error) {
            console.error("Error storing city data:", error);
        }
    };

    const handlePress = async (cityId, cityName) => {
        console.log("Selected City ID:", cityId);
        console.log("Selected City Name:", cityName);
        console.log("Selected Vehicle Type:", vehicleType);

        await storeCityData(cityId, cityName);

        navigation.navigate("SelectTour1", {
            selectedCityId: cityId,
            selectedCityName: cityName,
            vehicleType: vehicleType,
        });

        
        setSelectedCity({ cityId, cityName });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>“ Welcome Back Ganesh !! ”</Text>
                <Text style={styles.subText}>Where You Want to go ?</Text>
            </View>

            <View style={styles.citySelection}>
                <View style={styles.illustrationContainer}>
                    <Svg width="100%" height={height * 0.15} viewBox="0 0 200 100">
                        <Path stroke="#E0E0E0" fill="transparent" strokeWidth="2" />
                    </Svg>
                    <Image 
                        source={require("../../assets/images/bus1.png")} 
                        style={[styles.illustration, { width: screenWidth * 0.6 }]} 
                    />
                </View>

                <Text style={styles.cityLabel}>Select Start City</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#FF5722" />
                ) : (
                    cities.map((city) => (
                        <TouchableOpacity
                            key={city.cityId}
                            style={[styles.cityButton, { width: screenWidth * 0.4 }]}
                            onPress={() => handlePress(city.cityId, city.cityName)}
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
        marginTop: Platform.OS === "ios" ? height * 0.05 : height * 0.04,
    },
    header: {
        padding: width * 0.05,
        paddingTop: height * 0.07,
        height: height * 0.25,
        alignItems: "center",
        backgroundColor: "#FF5722",
        position: "relative",
        zIndex: 1,
        marginBottom: height * 0.015,
    },
    welcomeText: {
        fontSize: width * 0.08,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
    },
    subText: {
        fontSize: width * 0.04,
        color: "#fff",
        marginTop: height * 0.01,
        textAlign: "center",
        marginBottom: height * 0.07,
    },
    illustrationContainer: {
        alignItems: "center",
        marginTop: -height * 0.1,
        zIndex: 2,
    },
    illustration: {
        height: height * 0.15,
        resizeMode: "contain",
    },
    citySelection: {
        alignItems: "center",
        marginTop: height * 0.05,
        backgroundColor: "#fff",
        padding: width * 0.04,
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
        fontSize: width * 0.045,
        color: "#555",
        marginBottom: height * 0.02,
    },
    cityButton: {
        backgroundColor: "#FFCCBC",
        paddingVertical: height * 0.015,
        borderRadius: 12,
        marginVertical: height * 0.01,
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
        fontSize: width * 0.05,
        color: "#D84315",
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default Home;
