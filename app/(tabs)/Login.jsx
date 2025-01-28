import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Image, // Added Image import for the illustration
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width, height } = Dimensions.get("window");

const Login = () => {
  const [mobileNo, setMobileNo] = useState("");
  const navigation = useNavigation();

  // Function to handle OTP sending
  const sendOtp = async () => {
    if (!mobileNo || mobileNo.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number");
      return;
    }
  
    try {
      const response = await axios.post(
        "https://trialapp.somee.com/api/LoginAndRegistration/send-otp",
        { mobileNo }
      );
  
      if (response.status === 200) {
        // Save the mobile number to local storage
        await AsyncStorage.setItem('mobileNo', mobileNo);
  
        Alert.alert("Success", "OTP sent successfully!");
  
        // Navigate to OTP screen with mobileNo as a parameter
        navigation.navigate("Otp", { mobileNo }); // Correct navigation path
      } else {
        Alert.alert("Error", "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error(error);
    }
  };
  

  // Function to dismiss keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.innerContainer}>
          

          {/* Logo Illustration */}
          {/* <Image
            source={require("../../assets/Logo.jpg")} 
            style={styles.logo}
          /> */}
         <Image
          source={require("@/assets/images/Login.png")} 
          style={styles.image}
        />

          {/* Heading */}
          <Text style={styles.subheading}>
            Enter Your Mobile Number 
          </Text>

          {/* Mobile Input with country code */}
          <View style={styles.inputContainer}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Mobile Number"
              keyboardType="numeric"
              maxLength={10}
              value={mobileNo}
              onChangeText={setMobileNo}
            />
          </View>

          {/* Send OTP Button */}
          <TouchableOpacity style={styles.button} onPress={sendOtp}>
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", 
  },
  backArrow: {
    marginTop: -30,
    marginBottom: 20,
    marginLeft:-310
  },
  logo: {
    width: width * 0.3,
    height: height * 0.15,
    resizeMode: "contain",
    marginBottom: 30,
    borderRadius:100,
    marginTop:-20,
  },
  image: {
    width: width * 0.95, // Increased width
    height: height * 0.5, // Increased height
    alignSelf: "center",
    resizeMode: "contain",
    marginBottom: 0,
    marginTop: 80,
  },
  
  heading: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#333", // Dark color for contrast
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    color: "#000", // Soft gray for subtext
    marginBottom: 20,
    paddingHorizontal: 10,
    marginLeft:-130,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
  countryCode: {
    fontSize: 16,
    color: "#6B7280",
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: "#D1D5DB",
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#D44206",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
    width:180,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Login;
