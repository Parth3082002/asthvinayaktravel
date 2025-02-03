import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from "react-native";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons"; // Ensure this is installed
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from "buffer"; // Use Buffer for base64 decoding

const { width, height } = Dimensions.get("window");

const dismissKeyboard = () => {
  Keyboard.dismiss();
};

const Otp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { mobileNo } = route.params || {};

  const handleInputChange = (text, index) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = text;
    setOtp(updatedOtp);

    // Move focus to the next input if there's a value
    if (text && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await axios.post(
        "https://trialapp.somee.com/api/LoginAndRegistration/resend-otp",
        { mobileNo },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "A new OTP has been sent to your mobile number.");
      } else {
        Alert.alert("Error", "Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to resend OTP. Please try again.";
      Alert.alert("Error", errorMessage);
      console.error(error);
    }
  };

  const verifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      Alert.alert("Error", "Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      const response = await axios.post(
        "http://ashtavinayak.somee.com/api/User/VerifyOTP", // Updated API URL
        { mobileNo, otp: enteredOtp },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data.token) {
        const token = response.data.token;
        console.log("Generated Token:", token);

        // Decode the token using Buffer
        const decodedPayload = decodeToken(token);
        console.log("Decoded Payload:", decodedPayload);

        // Check if the email exists in the decoded token
        if (decodedPayload && decodedPayload.email) {
          // If email exists, redirect to Home page
          Alert.alert("Success", "OTP verified successfully!", [
            {
              text: "OK",
              onPress: () => {
                navigation.navigate("SelectVehicle");
              },
            },
          ]);
        } else {
          // If email does not exist, redirect to Registration page
          Alert.alert("Success", "OTP verified successfully!", [
            {
              text: "OK",
              onPress: () => {
                navigation.navigate("SelectVehicle", {
                  token,
                  mobileNo,
                });
              },
            },
          ]);
        }

        // Store mobileNo, token, and user details in AsyncStorage
        await AsyncStorage.setItem("mobileNo", mobileNo);
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

        // Optionally, you can log the user data and token to confirm successful storage
        console.log("User Details Stored:", response.data.user);
      } else {
        Alert.alert("Error", "Invalid OTP. Please try again.");
      }
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Failed to verify OTP. Please try again.";
      Alert.alert("Error", errorMessage);
      console.error(error);
    }
  };

  const decodeToken = (token) => {
    try {
      // Split the token into three parts: header, payload, and signature
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = parts[1];
        // Decode the payload from Base64 to UTF-8
        const decodedPayload = Buffer.from(payload, "base64").toString("utf-8");
        return JSON.parse(decodedPayload);
      } else {
        throw new Error("Invalid token structure.");
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/Verify.png")} // Ensure the image path is correct
              style={styles.image}
            />
          </View>

          {/* OTP Verification Title */}
          <Text style={styles.verificationHeading}>OTP Verification</Text>

          <Text style={styles.title}>Check your phone for the OTP</Text>
          <Text style={styles.subtitle}>Sent to: {mobileNo}</Text>

          {/* OTP Input Fields */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (otpRefs.current[index] = ref)}
                style={styles.otpInput}
                value={digit}
                onChangeText={(text) => handleInputChange(text, index)}
                keyboardType="numeric"
                maxLength={1}
                onKeyPress={({ nativeEvent }) => {
                  if (
                    nativeEvent.key === "Backspace" &&
                    index > 0 &&
                    !otp[index]
                  ) {
                    otpRefs.current[index - 1]?.focus();
                  }
                }}
              />
            ))}
          </View>

          {/* Not Received Text */}
          <Text style={styles.notReceivedText}>
            Not received yet? Resend it
          </Text>

          {/* Resend Code Link */}
          <TouchableOpacity style={styles.resendButton} onPress={handleResendOtp}>
            <Text style={styles.resendText}>Resend Code</Text>
          </TouchableOpacity>

          {/* Verify OTP Button */}
          <TouchableOpacity style={styles.nextButton} onPress={verifyOtp}>
            <Text style={styles.nextText}>Verify OTP</Text>
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
    paddingHorizontal: 20,
  },
  backArrow: {
    marginTop: 50,
    marginBottom: 20,
    position: "absolute",
    left: 0,
    zIndex: 1,
  },
  verificationHeading: {
    fontSize: 20, // Adjust font size as needed
    fontWeight: "bold", // Makes the heading bold
    textAlign: "center", // Centers the text
    color: "#111", // Adjust color if needed
    marginBottom: 10, // Adds spacing between the heading and the next text
  },
  
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: width * 0.3,
    height: height * 0.15,
    resizeMode: "contain",
    marginBottom: 30,
    borderRadius:100,
    marginTop:60,
  },
  image: {
    width: width * 0.9,
    height: height * 0.3,
    alignSelf: "center",
    resizeMode: "contain",
    marginBottom: 0,
    marginTop:100,
    borderRadius:60,
  },
  title: {
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  otpInput: {
    width: 45,
    height: 45,
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    textAlign: "center",
    marginHorizontal: 5,
  },
  nextButton: {
    backgroundColor: "#D44206",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
    width:200,
    marginLeft:40,
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resetButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  resetText: {
    fontSize: 16,
    color: "blue",
    fontWeight: "bold",
    marginLeft:204,
    marginTop:-30,
  },
  notReceivedText: {
    textAlign: "center",
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 10,
  },
  resendButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  resendText: {
    fontSize: 16,
    color: "blue",
    fontWeight: "bold",
  },
});

export default Otp;
