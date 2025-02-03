import React, { useEffect } from "react";
import { Text, View, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token"); // Checking if token exists in AsyncStorage
        if (token) {
          router.push("SelectVehicle"); // Navigate to SelectVehicle page if token exists
        } else {
          router.push("Login"); // Navigate to Login page if no token
        }
      } catch (error) {
        console.error("Error reading token from AsyncStorage", error);
        router.push("Login"); // Default fallback if error occurs
      }
    };

    // Check the token on component mount
    checkToken();

    // Redirect to the next page after 5 seconds
    const timer = setTimeout(() => {
      checkToken();
    }, 5000);

    return () => clearTimeout(timer); // Cleanup the timer
  }, [router]);

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/Bappa.png")} // Replace with your image path
        style={styles.logo}
      />
      <Text style={styles.prayerText}>॥ OM GANESHAY NAMA: ॥</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCF1DF", // Background color matching the image
  },
  logo: {
    width: 250, // Adjusted size to fit design
    height: 250,
    resizeMode: "contain",
  },
  prayerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF4500", // Bright orange color for text
    textAlign: "center",
    marginTop: 20,
  },
});

export default Index;
