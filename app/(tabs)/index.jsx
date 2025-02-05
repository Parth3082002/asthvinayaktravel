import React, { useEffect, useRef } from "react";
import { View, Image, Animated, StyleSheet, Dimensions, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const images = [
  require("@/assets/images/Bappa.png"),
  require("@/assets/images/Bappa.png"),
  require("@/assets/images/Bappa.png"),
  require("@/assets/images/Bappa.png"),
  require("@/assets/images/Bappa.png"),
  require("@/assets/images/Bappa.png"),
  require("@/assets/images/Bappa.png"),
  require("@/assets/images/Bappa.png"),
];

const { width, height } = Dimensions.get("window");
const CIRCLE_RADIUS = width * 0.3; // Adjust the radius of the circular motion

const Index = () => {
  const router = useRouter();
  const moveAnim = useRef(new Animated.Value(0)).current;  // Animation to move the images around the center

  useEffect(() => {
    Animated.loop(
      Animated.timing(moveAnim, {
        toValue: 1,
        duration: 8000, // 8 seconds for one full circular motion
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Interpolation to calculate the movement of images around the circle
  const interpolatedMove = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 360], // Moves from 0 to 360 degrees (full rotation)
  });

  const handleLoginPress = async () => {
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

  return (
    <View style={styles.container}>
      {/* Animated Circular Container that moves around the center */}
      <Animated.View
        style={[
          styles.circleContainer,
          {
            transform: [{ rotate: interpolatedMove.interpolate({
                inputRange: [0, 360],
                outputRange: ["0deg", "360deg"]
              })}]
          },
        ]}
      >
        {/* Fixed Image positions around the center */}
        {images.map((image, index) => {
          const angle = (index * (360 / images.length)) * (Math.PI / 180);
          const x = CIRCLE_RADIUS * Math.cos(angle);
          const y = CIRCLE_RADIUS * Math.sin(angle);

          return (
            <Image
              key={index}
              source={image}
              style={[
                styles.image,
                { left: width / 2 + x - 40, top: height / 2 + y - 40 }, // Position images in a circle
              ]}
            />
          );
        })}
      </Animated.View>

      {/* Center Ganesha Image */}
      <Image
        source={require("@/assets/images/Bappa.png")}
        style={styles.centerImage}
      />

      {/* Footer with Login Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCF1DF", // Background color
    justifyContent: "center",
    alignItems: "center",
  },
  circleContainer: {
    position: "absolute",
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    position: "absolute",
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  centerImage: {
    width: 120,
    height: 120,
    position: "absolute",
    resizeMode: "contain",
  },
  footer: {
    position: "absolute",
    bottom: 30, // Adjust as needed
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#D44206",
    paddingVertical: 10,
    paddingHorizontal: 100,
    borderRadius: 5,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Index;
