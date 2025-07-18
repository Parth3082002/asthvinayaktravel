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
  Keyboard,
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import axios from "axios";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from "buffer";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width, height } = Dimensions.get("window");

const dismissKeyboard = () => {
  Keyboard.dismiss();
};

const Otp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const hiddenInputRef = useRef();
  const navigation = useNavigation();
  const route = useRoute();
  const { mobileNo } = route.params || {};
  const [loading, setLoading] = useState(false);

  // Handler for hidden input autofill
  const handleHiddenInputChange = (text) => {
    if (text.length === 6 && /^[0-9]{6}$/.test(text)) {
      setOtp(text.split(""));
      hiddenInputRef.current?.blur();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setOtp(["", "", "", "", "", ""]);
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        navigation.goBack();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [navigation])
  );

  const handleInputChange = (text, index) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = text;
    setOtp(updatedOtp);

    if (text && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await axios.post(
        "https://ashtavinayak.itastourism.com/api/User/LoginByOTP",
        { MobileNo: mobileNo },
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
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
      console.error(error);
    }
  };

  const verifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      Alert.alert("Error", "Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://ashtavinayak.itastourism.com/api/User/VerifyOTP",
        { mobileNo, otp: enteredOtp },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data.token) {
        const token = response.data.token;

        const decodedPayload = decodeToken(token);

        Alert.alert("Success", "OTP verified successfully!", [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("SelectVehicle1", {
                token,
                mobileNo,
              }),
          },
        ]);

        await AsyncStorage.setItem("mobileNo", mobileNo);
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      } else {
        Alert.alert("Error", "Invalid OTP. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const decodeToken = (token) => {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = parts[1];
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
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={{ flex: 1 }}>
        {/* Hidden input for Android autofill popup */}
        <TextInput
          ref={hiddenInputRef}
          style={{ position: "absolute", opacity: 0, height: 0, width: 0 }}
          value={otp.join("")}
          onChangeText={handleHiddenInputChange}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          keyboardType="numeric"
          maxLength={6}
          importantForAutofill="yes"
          returnKeyType="done"
          blurOnSubmit={true}
        />
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={20}
        >
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Image source={require("@/assets/images/Verify.png")} style={styles.image} />
            </View>

            <Text style={styles.verificationHeading}>OTP Verification</Text>
            <Text style={styles.title}>Check your phone for the OTP</Text>
            <Text style={styles.subtitle}>Sent to: {mobileNo}</Text>

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
                    if (nativeEvent.key === "Backspace" && index > 0 && !otp[index]) {
                      otpRefs.current[index - 1]?.focus();
                    }
                  }}
                />
              ))}
            </View>

            <Text style={styles.notReceivedText}>Not received yet? Resend it</Text>

            <TouchableOpacity style={styles.resendButton} onPress={handleResendOtp} disabled={loading}>
              <Text style={styles.resendText}>Resend Code</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextButton} onPress={verifyOtp} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.nextText}>Verify OTP</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  verificationHeading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111",
    marginBottom: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: width * 0.9,
    height: height * 0.3,
    alignSelf: "center",
    resizeMode: "contain",
    marginTop: 100,
    borderRadius: 60,
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
    width: 200,
    marginLeft: "auto",
    marginRight: "auto",
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
