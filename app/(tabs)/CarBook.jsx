import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  BackHandler,
  ActivityIndicator,
  Platform
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { CommonActions } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import RazorpayCheckout from 'react-native-razorpay';
import Icon from "react-native-vector-icons/Ionicons";

const CarBook = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Razorpay Keys - Directly integrated in the code
  // Use these for development/testing
  const RAZORPAY_KEY_ID = 'rzp_test_SqJODX06AyCHj3';
  const RAZORPAY_KEY_SECRET = 'MXmpWdb28AdoOLWw3Vexsw0Q';

  // For production, uncomment these lines and comment out the test keys above
  // const RAZORPAY_KEY_ID = 'rzp_live_DGlzWoiGqqLg0A';
  // const RAZORPAY_KEY_SECRET = 'your_live_secret_key_here';

  // Extract bookingData safely with default values
  const { bookingData = {} } = route.params || {};

  // Extract all values from bookingData
  const {
    carType ,
    carTypeLabel = carType,
    acType = "",
    childWithSeatP = 0,
    childWithoutSeatP = 0,
    withoutBookingAmount = 0,
    price,
    date = new Date().toISOString().split('T')[0], // Default to today if not provided
    time = new Date().toTimeString().split(' ')[0], // Default to current time if not provided
    selectedPickupPointId = 0,
    selectedPickupPoint = "",
    cityId = 0,
    cityName = "",
    status = "Confirmed",
    vehicleType = "",
    carTotalSeat = 5,

  } = bookingData;

  // Extract additional parameters from route.params
  const {
    selectedVehicleId = 0,
    selectedBus = false,
    packageName = "",
    packageId = 0,
    categoryName = "",
    categoryId = 0,
    destinationId = "",
    destinationName = "",
    tuljapur = false,
    withoutBookingAmount: routeWithoutBookingAmount = 0,
  } = route.params || {};

  // Total seats based on car type
  const totalSeats = bookingData.carTotalSeat || route.params?.carTotalSeat || 5;
  const carTypesss = carType;
  // State for user data
  const [user, setUser] = useState(null);
  const [mobileNo, setMobileNo] = useState(null);
  const [token, setToken] = useState(null);

  // State for booking details
  const [pickupLocation, setPickupLocation] = useState(selectedPickupPoint);
  const [droppoint, setDroppoint] = useState(selectedPickupPoint || "");
  const [roomType, setRoomType] = useState("shared");
  const [adults, setAdults] = useState("");
  const [childWithSeat, setChildWithSeat] = useState("");
  const [childWithoutSeat, setChildWithoutSeat] = useState("");
  const [isAlertShown, setIsAlertShown] = useState(false);
  const [availableRoomTypes, setAvailableRoomTypes] = useState(["shared", "Separate"]);

  // State for payment details
  const [totalAmount, setTotalAmount] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [totalPersons, setTotalPersons] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // UI state
  const [isEditable, setIsEditable] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch user data from AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedMobileNo = await AsyncStorage.getItem("mobileNo");
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedMobileNo && storedToken && storedUser) {
          setMobileNo(storedMobileNo);
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          Alert.alert("Error", "Login information not found. Please log in again.");
        }
      } catch (error) {
        console.error("Error retrieving user data:", error);
        Alert.alert("Error", "Failed to retrieve user information.");
      }
    };
    fetchUserData();
  }, []);

  // Log all parameters
  useEffect(() => {
    console.log("=== CarBook - All Parameters ===");
    console.log("Date from CarType:", date);
    console.log("Time from CarType:", time);
    console.log("PackageId:", packageId);
    console.log("PackageName:", packageName);
    console.log("CategoryId:", categoryId);
    console.log("CategoryName:", categoryName);
    console.log("price: ",price)
    console.log("withoutBookingAmount from bookingData:", withoutBookingAmount);
    console.log("withoutBookingAmount from route.params:", routeWithoutBookingAmount);
    console.log("selectedBus:", selectedBus);
    console.log("=== End CarBook Parameters ===");
  }, [date, time, packageId, packageName, categoryId, categoryName, withoutBookingAmount, routeWithoutBookingAmount, selectedBus]);

  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        navigation.navigate('CarType', {
          selectedPickupPointId,
          selectedPickupPoint,
          price,
          vehicleType,
          childWithSeatP,
          childWithoutSeatP,
          withoutBookingAmount,
          cityId,
          cityName,
          carType,
          carTotalSeat,
          // Add any other parameters you want to preserve from route.params
          ...route.params,
        });
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }, [navigation, route, selectedPickupPointId, selectedPickupPoint, price, vehicleType, childWithSeatP, childWithoutSeatP, withoutBookingAmount, cityId, cityName, carType, carTotalSeat])
  );

  // Function to handle back navigation and clear states
  const handleBackNavigation = () => {
    console.log("=== CarBook - Back Navigation ===");
    console.log("Navigating back to SelectVehicle1 and clearing states");
    
    // Clear all local states
    setAdults("");
    setChildWithSeat("");
    setChildWithoutSeat("");
    setPickupLocation("");
    setDroppoint("");
    setRoomType("shared");
    setTotalAmount(0);
    setAdvanceAmount(0);
    setTotalPersons(0);
    setErrorMessage("");
    setPaymentProcessing(false);
    setIsEditable(false);
    setErrors({});
    setIsAlertShown(false);
    setAvailableRoomTypes(["shared"]);
    
    console.log("All states cleared");
    console.log("=== End Back Navigation ===");
    
    // Navigate to SelectVehicle1 and reset the navigation stack
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "SelectVehicle1" }],
      })
    );
  };

  // Calculate price based on inputs


  const calculatePrice = () => {
    const numAdults = parseInt(adults) || 0;
    const numChildWithSeat = parseInt(childWithSeat) || 0;
    const numChildWithoutSeat = parseInt(childWithoutSeat) || 0;
  
    const totalSeatUsers = numAdults + numChildWithSeat;
    const totalPersonsCount = totalSeatUsers + numChildWithoutSeat;
    const childWithoutSeatCost = numChildWithoutSeat * childWithoutSeatP;
  
    if (totalPersonsCount > totalSeats) {
      alert("Total passengers cannot exceed total seats.");
      return;
    }
  
    setTotalPersons(totalPersonsCount);
  
    // Base price covers up to 2 seated passengers (adult + childWithSeat)
    let finalPrice = price + childWithoutSeatCost;
    if (totalSeatUsers > 2) {
     
      const extraSeats = totalSeatUsers - 2;
      finalPrice += extraSeats * withoutBookingAmount;
    }
  
    setTotalAmount(finalPrice);
    setAdvanceAmount(Math.ceil(finalPrice / 2));
    // setRoomType("shared");
  };
  

  // Recalculate price when inputs change
  useEffect(() => {
    calculatePrice();
  }, [adults, childWithSeat, childWithoutSeat, roomType]);

  // Validate total persons don't exceed total seats
  useEffect(() => {
    const numAdults = parseInt(adults) || 0;
    const numChildWithSeat = parseInt(childWithSeat) || 0;
    const totalBookedPersons = numAdults + numChildWithSeat;
  
    if (totalBookedPersons > totalSeats) {
      Alert.alert("Warning", "Total persons exceed booked seats.", [
        {
          text: "OK",
          onPress: () => {
            if (numAdults > totalSeats) {
              setAdults("");
            } else {
              setChildWithSeat("");
            }
          },
        },
      ]);
    }

  }, [adults, childWithSeat, totalSeats]);

  // Validate all inputs before payment/booking
  const validateInputs = () => {
    console.log("=== Validating Inputs ===");
    const newErrors = {};
    
    if (!adults && !childWithSeat) {
      newErrors.seatCount = "Please enter at least one adult or child with seat";
      console.log("❌ Validation failed: No adults or children with seat");
    }
    
    if (!droppoint) {
      newErrors.droppoint = "Please enter a drop location";
      console.log("❌ Validation failed: No drop point");
    }
    
    if (!pickupLocation) {
      newErrors.pickupLocation = "Please select a pickup location";
      console.log("❌ Validation failed: No pickup location");
    }
    
    if (!carTypeLabel) {
      newErrors.carType = "Please select a car type";
      console.log("❌ Validation failed: No car type");
    }
    
    console.log("Validation errors:", newErrors);
    console.log("Validation passed:", Object.keys(newErrors).length === 0);
    console.log("=== End Validation ===");
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle advance amount input change
  const handleAdvanceInputChange = (value) => {
    const numericValue = parseFloat(value) || 0;
    setAdvanceAmount(numericValue);
  
    const minAdvance = totalAmount / 2;
    if (numericValue < minAdvance) {
      setErrorMessage(`Advance amount should be at least ₹${minAdvance}`);
    } else {
      setErrorMessage("");
    }
  };
  
  // Handle child without seat input
  const handleTextChange = (text) => {
    if (!isAlertShown && text !== "") {
      Alert.alert(
        "Additional Charge",
        `Child without seat cost: ₹${childWithoutSeatP} per person. This amount will be added to your total.`,
        [{ text: "OK", onPress: () => setIsAlertShown(true) }]
      );
    }
    setChildWithoutSeat(text);
  };

  // Improved payment function that works with PaymentScreen
  const handlePayment = async (amount, isAdvancePayment = false) => {
    console.log("=== handlePayment called ===");
    console.log("Amount:", amount);
    console.log("Is Advance Payment:", isAdvancePayment);
    
    // Validate fields first
    if (!validateInputs()) {
      console.log("❌ Validation failed, returning false");
      return false;
    }
    console.log("✅ Validation passed");
  
    // Check if user exists
    if (!user || !user.userId || !token) {
      console.log("❌ User validation failed");
      Alert.alert("Error", "User not found. Please log in again.");
      return false;
    }
    console.log("✅ User validation passed");
  
    setPaymentProcessing(true);
  
    try {
      // Combine date and time into a valid DateTime format
      // const combinedDateTime = new Date(`${date}T${time}`);
      const carPayment = true;
      
      console.log("=== CarBook - Passing Parameters to PaymentScreen ===");
      console.log("Date from CarType:", date);
      console.log("Time from CarType:", time);
      console.log("Combined DateTime:", date);
      console.log("PackageId:", packageId);
      console.log("PackageName:", packageName);
      console.log("CategoryId:", categoryId);
      console.log("CategoryName:", categoryName);
      console.log("Adults:", adults);
      console.log("Child with seat:", childWithSeat);
      console.log("Child without seat:", childWithoutSeat);
      console.log("=== End Parameters ===");
      
      console.log("🚀 Attempting to navigate to PaymentScreen...");
      // Navigate to PaymentScreen with all necessary props
      navigation.navigate("PaymentScreen", {
        amount,
        isAdvancePayment,
        userId: user?.userId,
        userName: user?.userName,
        email: user?.email,
        phone: user?.phoneNumber,
        carType: carTypeLabel,
        // pickupPointId: 1,
        pickupLocation,
        droppoint,
        roomType,
        totalAmount: parseFloat(totalAmount),
        acType,
        cityId,
        cityName,
        vehicleType,
        carPayment,
        bookingDate: date,
        bookingTime: time,
        packageId: packageId,
        packageName: packageName,
        categoryId: categoryId,
        categoryName: categoryName,
        adults: adults,
        childWithSeat: childWithSeat,
        childWithoutSeat: childWithoutSeat,
        razorpayKeyId: RAZORPAY_KEY_ID,
        remainingPayment : false
      });
      
      return true;
    } catch (error) {
      console.error("General payment error:", error);
      setPaymentProcessing(false);
      Alert.alert("Error", "Payment processing failed. Please try again.");
      return false;
    }
  };

  // Payment button handlers
  const handlePayFull = () => {
    console.log("=== Pay Full Button Clicked ===");
    console.log("Total Amount:", totalAmount);
    console.log("Adults:", adults);
    console.log("Child with seat:", childWithSeat);
    console.log("Drop point:", droppoint);
    console.log("Pickup location:", pickupLocation);
    console.log("Car type label:", carTypeLabel);
    console.log("PackageId:", packageId);
    console.log("PackageName:", packageName);
    console.log("Date:", date);
    console.log("Time:", time);
    console.log("User:", user);
    console.log("Token:", token);
    console.log("=== End Pay Full Debug ===");
    handlePayment(totalAmount, false);
  };

  const handlePayAdvance = () => {
    console.log("=== Pay Advance Button Clicked ===");
    console.log("Advance Amount:", advanceAmount);
    console.log("Total Amount:", totalAmount);
    console.log("PackageId:", packageId);
    console.log("PackageName:", packageName);
    console.log("Date:", date);
    console.log("Time:", time);
    console.log("=== End Pay Advance Debug ===");
    const minAdvance = totalAmount / 2;
    if (advanceAmount < minAdvance) {
      setErrorMessage(`Advance amount should be at least ₹${minAdvance}`);
      return;
    }
    handlePayment(advanceAmount, true);
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackNavigation}
          style={styles.backButtonContainer}
        >
          <View style={styles.backButtonCircle}>
            <Text style={styles.backButton}>{"<"}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerText}>Seat Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={styles.card}>
          {/* User Details */}
          <View style={styles.inputFieldContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={[styles.input, !isEditable && styles.nonEditableInput]}
              placeholder="Your Name"
              placeholderTextColor="#aaa"
              value={user?.userName || ""}
              editable={isEditable}
            />
          </View>

          <View style={styles.inputFieldContainer}>
            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              style={[styles.input, !isEditable && styles.nonEditableInput]}
              placeholder="Your Contact"
              keyboardType="numeric"
              placeholderTextColor="#aaa"
              value={user?.phoneNumber || ""}
              editable={false}
            />
          </View>

          {/* Seat Selection */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Available Seats</Text>
              <TextInput
                style={[styles.input, !isEditable && styles.nonEditableInput]}
                value={totalSeats.toString()}
                editable={false}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Passengers</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={adults}
                onChangeText={setAdults}
              />
              {errors.seatCount && (
                <Text style={styles.errorText}>{errors.seatCount}</Text>
              )}
            </View>
          </View>
{/* 
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Child (With Seat)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={childWithSeat}
                onChangeText={setChildWithSeat}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Child (Without Seat)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={childWithoutSeat}
                onChangeText={handleTextChange}
              />
            </View>
          </View> */}

          {/* Room Type Selection */}
          <View style={{ marginBottom: 18 }}>
            <Text style={styles.label}>Room Type</Text>
            <View style={[styles.inputWithIcon, !isEditable && styles.nonEditableInput]}>
              <Icon name="bed-outline" size={20} color="#555" />
              <Picker
                selectedValue={roomType}
                style={{ flex: 1, minHeight: 44 }}
                enabled={!isEditable}
                onValueChange={(itemValue) => setRoomType(itemValue)}
              >
                {availableRoomTypes.map((type) => (
                  <Picker.Item key={type} label={type.charAt(0).toUpperCase() + type.slice(1)} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Locations */}
          {/* Pickup Location Field */}
          <View style={{ marginBottom: 18 }}>
            <Text style={styles.label}>Pickup Location</Text>
            <View
              style={[
                styles.inputWithIcon,
                !isEditable && styles.nonEditableInput,
              ]}
            >
              <Icon name="location-outline" size={20} color="#555" />
              <TextInput
                style={[styles.inputWithoutPadding, { minHeight: 44, maxHeight: 100 }]}
                value={pickupLocation}
                placeholder="Pickup Location"
                placeholderTextColor="#aaa"
                onChangeText={setPickupLocation}
                editable={isEditable}
                multiline={true}
                numberOfLines={2}
                scrollEnabled={true}
                textAlignVertical="top"
              />
            </View>
            {errors.pickupLocation && (
              <Text style={styles.errorText}>{errors.pickupLocation}</Text>
            )}
          </View>
          {/* Drop Location Field */}
          <View style={{ marginBottom: 18 }}>
            <Text style={styles.label}>Drop Location</Text>
            <View
              style={[
                styles.inputWithIcon,
                !isEditable && styles.nonEditableInput,
              ]}
            >
              <Icon name="location-outline" size={20} color="#555" />
              <TextInput
                style={[styles.inputWithoutPadding, { minHeight: 44, maxHeight: 100 }]}
                value={droppoint}
                placeholder="Drop Location"
                placeholderTextColor="#aaa"
                onChangeText={setDroppoint}
                editable={isEditable}
                multiline={true}
                numberOfLines={2}
                scrollEnabled={true}
                textAlignVertical="top"
              />
            </View>
            {errors.droppoint && (
              <Text style={styles.errorText}>{errors.droppoint}</Text>
            )}
          </View>

          {/* Payment Section */}
          <Text style={styles.label}>Total Amount</Text>
          <TextInput
            style={[styles.input, !isEditable && styles.nonEditableInput]}
            value={`₹${totalAmount.toString()}`}
            editable={false}
          />

          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePayFull}
            disabled={paymentProcessing}
          >
            {paymentProcessing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.payButtonText}>Pay Full</Text>
            )}
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, styles.payAdvanceButton]}
              onPress={handlePayAdvance}
              disabled={paymentProcessing}
            >
              {paymentProcessing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Pay Advance</Text>
              )}
            </TouchableOpacity>
            <TextInput
              style={[styles.input, styles.advanceInput]}
              placeholder="Enter Amount"
              keyboardType="numeric"
              placeholderTextColor="#aaa"
              value={advanceAmount ? advanceAmount.toString() : ""}
              onChangeText={handleAdvanceInputChange}
            />
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Payment Icons */}
          <View style={styles.paymentIconsContainer}>
            <Image
              source={require("@/assets/images/GooglePay.png")}
              style={styles.icon}
            />
            <Image
              source={require("@/assets/images/PhonePay.png")}
              style={styles.icon}
            />
            <Image
              source={require("@/assets/images/MasterCard.png")}
              style={styles.icon}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 30,
    paddingBottom: 45,
  },
  header: {
    backgroundColor: "#D44206",
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonContainer: {
    marginRight: 15,
  },
  backButtonCircle: {
    backgroundColor: "#fff",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D44206",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  formContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  inputFieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  nonEditableInput: {
    backgroundColor: "#f9f9f9",
    color: "#666",
  },
  row: {
    flexDirection: "row",
    marginBottom: 15,
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  halfInputContainer: {
    width: "48%",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
  },
  inputWithoutPadding: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 5,
  },
  payButton: {
    backgroundColor: "#D44206",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 20,
  },
  payButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  payAdvanceButton: {
    backgroundColor: "#1976D2",
    maxWidth: "40%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  advanceInput: {
    flex: 1,
    marginLeft: 10,
  },
  paymentIconsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    flexWrap: "wrap",
  },
  icon: {
    width: 60,
    height: 40,
    resizeMode: "contain",
    marginHorizontal: 10,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  infoText: {
    color: "#D44206",
    fontSize: 12,
    marginTop: 5,
  },
});

export default CarBook;