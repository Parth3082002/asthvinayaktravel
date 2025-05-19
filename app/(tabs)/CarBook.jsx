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
import { CommonActions } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import RazorpayCheckout from 'react-native-razorpay';
import Icon from "react-native-vector-icons/Ionicons";

const CarBook = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Razorpay Keys - Directly integrated in the code
  // Use these for development/testing
  const RAZORPAY_KEY_ID = 'rzp_test_AiL3OYgdBPKEeu';
  const RAZORPAY_KEY_SECRET = 'dRNtUmxCFSqA8mBIuOJjNmR9';

  // For production, uncomment these lines and comment out the test keys above
  // const RAZORPAY_KEY_ID = 'rzp_live_DGlzWoiGqqLg0A';
  // const RAZORPAY_KEY_SECRET = 'your_live_secret_key_here';

  // Extract bookingData safely with default values
  const { bookingData = {} } = route.params || {};

  // Extract all values from bookingData
  const {
    carType = 0,
    carTypeLabel = "",
    acType = "",
    childWithSeatP = 0,
    childWithoutSeatP = 0,
    price = 0,
    date = new Date().toISOString().split('T')[0], // Default to today if not provided
    time = new Date().toTimeString().split(' ')[0], // Default to current time if not provided
    selectedPickupPointId = 0,
    selectedPickupPoint = "",
    cityId = 0,
    cityName = "",
    status = "Confirmed",
    vehicleType = "",
  } = bookingData;

  // Total seats based on car type
  const totalSeats = carType;

  // State for user data
  const [user, setUser] = useState(null);
  const [mobileNo, setMobileNo] = useState(null);
  const [token, setToken] = useState(null);

  // State for booking details
  const [pickupLocation, setPickupLocation] = useState(selectedPickupPoint);
  const [droppoint, setDroppoint] = useState("");
  const [roomType, setRoomType] = useState("shared");
  const [adults, setAdults] = useState("");
  const [childWithSeat, setChildWithSeat] = useState("");
  const [childWithoutSeat, setChildWithoutSeat] = useState("");
  const [isAlertShown, setIsAlertShown] = useState(false);
  const [availableRoomTypes, setAvailableRoomTypes] = useState(["shared"]);

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

  // Handle hardware back button
  useEffect(() => {
    const backAction = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'SelectVehicle1' }],
      });
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Calculate price based on inputs
  const calculatePrice = () => {
    // Validate inputs to avoid NaN
    const numAdults = parseInt(adults) || 0;
    const numChildWithSeat = parseInt(childWithSeat) || 0;
    const numChildWithoutSeat = parseInt(childWithoutSeat) || 0;
    
    // Basic calculation (totalSeats * price per seat)
    let finalPrice = totalSeats * price;
    
    // Adjust for child with seat (applying discount)
    const childWithSeatCost = (price - childWithSeatP) * numChildWithSeat;
    
    // Add cost for child without seat
    const childWithoutSeatCost = numChildWithoutSeat * childWithoutSeatP;
    
    // Calculate final price
    finalPrice = finalPrice - childWithSeatCost + childWithoutSeatCost;
    
    // Calculate total persons
    const totalPersonsCount = numAdults + numChildWithSeat + numChildWithoutSeat;
    setTotalPersons(totalPersonsCount);
    
    // Update room types based on total persons
    if (totalPersonsCount >= 4) {
      setAvailableRoomTypes(["shared", "family"]);
    } else {
      setAvailableRoomTypes(["shared"]);
      if (roomType !== "shared") {
        setRoomType("shared");
      }
    }
    
    // Apply family room surcharge if applicable
    if (totalPersonsCount >= 4 && roomType === "family") {
      finalPrice += totalPersonsCount * 500; // Family room surcharge
    }
    
    // Update state
    setTotalAmount(finalPrice);
    setAdvanceAmount(Math.ceil(finalPrice / 2)); // Round up for advance amount
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
    const newErrors = {};
    
    if (!adults && !childWithSeat) {
      newErrors.seatCount = "Please enter at least one adult or child with seat";
    }
    
    if (!droppoint) {
      newErrors.droppoint = "Please enter a drop location";
    }
    
    if (!pickupLocation) {
      newErrors.pickupLocation = "Please select a pickup location";
    }
    
    if (!carTypeLabel) {
      newErrors.carType = "Please select a car type";
    }
    
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
    // Validate fields first
    if (!validateInputs()) {
      return false;
    }
  
    // Check if user exists
    if (!user || !user.userId || !token) {
      Alert.alert("Error", "User not found. Please log in again.");
      return false;
    }
  
    setPaymentProcessing(true);
  
    try {
      // Combine date and time into a valid DateTime format
      const combinedDateTime = new Date(`${date}T${time}`);
      
      // Navigate to PaymentScreen with all necessary props
      navigation.navigate("PaymentScreen", {
        amount,
        isAdvancePayment,
        userId: user?.userId,
        userName: user?.userName,
        email: user?.email,
        phone: user?.phoneNumber,
        carType: carTypeLabel,
        pickupPointId: selectedPickupPointId,
        droppoint,
        bookingDate: combinedDateTime.toISOString(),
        adults: parseInt(adults) || 0,
        roomType,
        childWithSeat: parseInt(childWithSeat) || 0,
        childWithoutSeat: parseInt(childWithoutSeat) || 0,
        totalAmount: parseFloat(totalAmount),
        acType,
        cityId,
        cityName,
        vehicleType,
        status,
        razorpayKeyId: RAZORPAY_KEY_ID,
        onPaymentComplete: (paymentId) => {
          processBooking(parseFloat(amount), paymentId);
        }
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
    handlePayment(totalAmount, false);
  };

  const handlePayAdvance = () => {
    const minAdvance = totalAmount / 2;
    if (advanceAmount < minAdvance) {
      setErrorMessage(`Advance amount should be at least ₹${minAdvance}`);
      return;
    }
    handlePayment(advanceAmount, true);
  };

  // Process booking after successful payment
  const processBooking = async (paidAmount, paymentId) => {
    setPaymentProcessing(true);
    
    try {
      // Combine date and time into a valid DateTime format
      const combinedDateTime = new Date(`${date}T${time}`);
    
      // Prepare booking data
      const bookingPayload = {
        carType: carTypeLabel,
        date: combinedDateTime.toISOString(),
        userId: user.userId,
        pickupPointId: selectedPickupPointId,
        droppoint,
        roomType,
        status: "Confirmed",
        totalPayment: totalAmount,
        advance: paidAmount,
        acType,
        cityId,
        cityName,
        vehicleType,
        // Add fields for passenger counts
        adults: parseInt(adults) || 0,
        childWithSeat: parseInt(childWithSeat) || 0,
        childWithoutSeat: parseInt(childWithoutSeat) || 0,
        paymentId: paymentId, // Add payment ID from Razorpay
        paymentStatus: "Completed"
      };
    
      const response = await fetch(
        "https://ashtavinayak.somee.com/api/Booking/BookCar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bookingPayload),
        }
      );
    
      setPaymentProcessing(false);
  
      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      let responseData;
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        responseData = await response.json();
        
        if (response.ok) {
          Alert.alert("Success", "Booking successful!", [
            {
              text: "OK",
              onPress: () =>
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: "SelectVehicle1" }],
                  })
                ),
            },
          ]);
        } else {
          const errorMessage = responseData.message || responseData.title || "Booking failed. Please try again.";
          Alert.alert("Booking Failed", errorMessage);
        }
      } else {
        // Handle non-JSON response
        if (response.ok) {
          Alert.alert("Success", "Booking successful!", [
            {
              text: "OK",
              onPress: () =>
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: "SelectVehicle1" }],
                  })
                ),
            },
          ]);
        } else {
          Alert.alert("Booking Failed", "Server returned an unexpected response. Please try again.");
        }
      }
    } catch (error) {
      setPaymentProcessing(false);
      console.error("API Error:", error);
      Alert.alert("Error", "Something went wrong during booking. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("SelectVehicle1")}
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
              <Text style={styles.label}>Total Seats</Text>
              <TextInput
                style={[styles.input, !isEditable && styles.nonEditableInput]}
                value={totalSeats.toString()}
                editable={false}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Adults</Text>
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
          </View>

          {/* Room Type */}
          <View style={styles.inputFieldContainer}>
            <Text style={styles.label}>Room Type:</Text>
            <View style={styles.inputWithIcon}>
              <Picker
                selectedValue={roomType}
                onValueChange={(itemValue) => setRoomType(itemValue)}
                style={{ flex: 1 }}
              >
                {availableRoomTypes.map((type) => (
                  <Picker.Item key={type} label={type.charAt(0).toUpperCase() + type.slice(1)} value={type} />
                ))}
              </Picker>
            </View>
            {roomType === "family" && (
              <Text style={styles.infoText}>Family room adds ₹500 per person</Text>
            )}
          </View>

          {/* Locations */}
          <View style={styles.row}>
            <View style={styles.halfInputContainer}>
              <Text style={styles.label}>Pickup Location</Text>
              <View
                style={[
                  styles.inputWithIcon,
                  !isEditable && styles.nonEditableInput,
                ]}
              >
                <Icon name="location-outline" size={20} color="#555" />
                <TextInput
                  style={styles.inputWithoutPadding}
                  value={pickupLocation}
                  placeholder="Pickup Location"
                  placeholderTextColor="#aaa"
                  onChangeText={setPickupLocation}
                  editable={isEditable}
                />
              </View>
              {errors.pickupLocation && (
                <Text style={styles.errorText}>{errors.pickupLocation}</Text>
              )}
            </View>

            <View style={styles.halfInputContainer}>
              <Text style={styles.label}>Drop Location</Text>
              <View style={styles.inputWithIcon}>
                <Icon name="location-sharp" size={20} color="#555" />
                <TextInput
                  style={styles.inputWithoutPadding}
                  placeholder="Drop Location"
                  placeholderTextColor="#aaa"
                  value={droppoint}
                  onChangeText={setDroppoint}
                />
              </View>
              {errors.droppoint && (
                <Text style={styles.errorText}>{errors.droppoint}</Text>
              )}
            </View>
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
    backgroundColor: "#f2f2f2",
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