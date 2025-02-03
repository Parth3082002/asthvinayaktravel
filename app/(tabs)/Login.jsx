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
  Image,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
        "http://ashtavinayak.somee.com/api/User/LoginByOTP",
        { MobileNo: mobileNo }
      );

      if (response.status === 200) {
        // Save the mobile number to local storage
        await AsyncStorage.setItem("mobileNo", mobileNo);

        Alert.alert("Success", "OTP sent successfully!");

        // Navigate to OTP screen with mobileNo as a parameter
        navigation.navigate("Otp", { mobileNo }); // Correct navigation path
      } else {
        Alert.alert("Error", "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      if (error.response) {
        // Handling server response error and displaying it in the alert
        Alert.alert("Error", error.response.data || "Something went wrong. Please try again.");
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
      // console.error(error);
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
          <Image
            source={require("@/assets/images/Login.png")}
            style={styles.image}
          />

          {/* Heading */}
          <Text style={styles.subheading}>Enter Your Mobile Number</Text>

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

          {/* Don't have an account? Register */}
          <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
            <Text style={styles.registerText}>
              Don't have an account?{" "}
              <Text style={styles.registerLink}>Register</Text>
            </Text>
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
  image: {
    width: width * 0.95,
    height: height * 0.5,
    alignSelf: "center",
    resizeMode: "contain",
    marginBottom: 0,
    marginTop: 80,
  },
  subheading: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    color: "#000",
    marginBottom: 20,
    paddingHorizontal: 10,
    marginLeft: -130,
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
    elevation: 2,
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
    width: 180,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  registerText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 10,
  },
  registerLink: {
    color: "#D44206",
    fontWeight: "600",
  },
});

export default Login;
