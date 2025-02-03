import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator } from "react-native";
import { Svg, Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
    const navigation = useNavigation();
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handlePress = (cityId, cityName) => {
        navigation.navigate("SelectTour", { selectedCityId: cityId, selectedCityName: cityName });
        console.log("Selected City ID:", cityId);
        console.log("Selected City Name:", cityName);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.welcomeText}>“ Welcome Back Ganesh ! ”</Text>
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

            {/* Upcoming Journey */}
            <View style={styles.journeyContainer}>
                <Text style={styles.sectionTitle}>Upcoming Journey</Text>
                <Text style={styles.detailsText}>PNR/Ticket No: 12345678</Text>
                <Text style={styles.detailsText}>Booking Time: 7.00 pm</Text>

                {/* Journey Details */}
                <View style={styles.journeyCard}>
                    <View style={styles.journeyRow}>
                        <View style={styles.icon}>
                            <Text style={styles.arrow}>↦</Text>
                        </View>
                        <View style={styles.journeyInfo}>
                            <Text style={styles.journeyLabel}>Start Point</Text>
                            <Text style={styles.journeyText}>8:05 PM, New Sangavi - Pick up near Sangavi Phata Naka, Sangavi</Text>
                            <Text style={styles.journeyText}>📞 9965913122, 9928296789</Text>
                        </View>
                        <Text style={styles.timeText}>PUNE {"\n"} 8:05 PM{"\n"}Sat, 13 Jan</Text>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.journeyRow}>
                        <View style={styles.icon}>
                            <Text style={styles.arrow}>↡</Text>
                        </View>
                        <View style={styles.journeyInfo}>
                            <Text style={styles.journeyLabel}>Drop Point</Text>
                            <Text style={styles.journeyText}>6:30 AM, DeepNagar</Text>
                        </View>
                        <Text style={styles.timeText}>RAIGAD {"\n"} 6:30 AM{"\n"}Mon, 14 Jan</Text>
                    </View>
                </View>
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
        fontSize: 22,
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
        marginTop: -90,
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

export default Home;
