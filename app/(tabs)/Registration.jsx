import React, { useState, useEffect } from "react";
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
  TouchableWithoutFeedback,
  Image,
  BackHandler,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const Registration = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  // Function to reset fields
  const resetFields = () => {
    setUserName("");
    setEmail("");
    setPhoneNumber("");
    setPasswordHash("");
  };

  // Function to handle user registration
  const handleRegistration = async () => {
    if (!userName || !email || !phoneNumber || !passwordHash) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
  
    if (phoneNumber.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }
  
    try {
      const response = await axios.post(
        "http://ashtavinayak.somee.com/api/User/Register",
        {
          UserName: userName,
          Email: email,
          PhoneNumber: phoneNumber,
          PasswordHash: passwordHash,
        }
      );
  
      if (response.status === 200) {
        Alert.alert("Success", "Registration successful!", [
          { 
            text: "OK", 
            onPress: () => {
              navigation.reset({ index: 0, routes: [{ name: "Login" }] });
              resetFields(); // Reset fields only after navigating
            } 
          }
        ]);
      } else {
        Alert.alert("Error", "Registration failed. Please try again.");
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
    <KeyboardAvoidingView style={styles.container}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.innerContainer}>
          {/* Logo Illustration */}
          <Image source={require("@/assets/images/register.png")} style={styles.image} />

          {/* Heading */}
          <Text style={styles.heading}>Create an Account</Text>

          {/* User Name Input */}
          <TextInput style={styles.input} placeholder="User Name" value={userName} onChangeText={setUserName} />

          {/* Email Input */}
          <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />

          {/* Phone Number Input */}
          <TextInput style={styles.input} placeholder="Phone Number" keyboardType="numeric" maxLength={10} value={phoneNumber} onChangeText={setPhoneNumber} />

          {/* Password Input */}
          <TextInput style={styles.input} placeholder="Password" secureTextEntry value={passwordHash} onChangeText={setPasswordHash} />

          {/* Register Button */}
          <TouchableOpacity style={styles.button} onPress={handleRegistration}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          {/* Link to Login Screen */}
          <TouchableOpacity onPress={() => {
            resetFields();
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          }}>
            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>Login</Text></Text>
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
    width: width * 0.8,
    height: height * 0.3,
    resizeMode: "contain",
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    backgroundColor: "#D44206",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginText: {
    fontSize: 14,
    color: "#6B7280",
  },
  loginLink: {
    color: "#D44206",
    fontWeight: "600",
  },
});

export default Registration;