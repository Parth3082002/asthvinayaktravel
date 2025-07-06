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
  ActivityIndicator,
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
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const resetFields = () => {
    setUserName("");
    setEmail("");
    setPhoneNumber("");
    setPasswordHash("");
  };

  const handleRegistration = async () => {
    if (!userName || !email || !phoneNumber || !passwordHash) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
  
    if (phoneNumber.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.post(
        "https://newenglishschool-001-site1.ktempurl.com/api/User/Register",
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
              resetFields();
            },
          },
        ]);
      }
    } catch (error) {
      let errorMessage = "Registration failed. Please try again.";
  
      if (error.response) {
        if (error.response.data && typeof error.response.data === "string") {
          errorMessage = error.response.data; // If response data is a string
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message; // If message field exists
        }
      }
  
      Alert.alert("Error", errorMessage);
      // console.error(error);
    } finally {
      setLoading(false);
    }
  };
  

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.innerContainer}>
          <Image source={require("@/assets/images/register.png")} style={styles.image} />
          <Text style={styles.heading}>Create an Account</Text>

          <TextInput style={styles.input} placeholder="User Name" value={userName} onChangeText={setUserName} />
          <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Phone Number" keyboardType="numeric" maxLength={10} value={phoneNumber} onChangeText={setPhoneNumber} />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry value={passwordHash} onChangeText={setPasswordHash} />

          <TouchableOpacity style={styles.button} onPress={handleRegistration} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
          </TouchableOpacity>

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