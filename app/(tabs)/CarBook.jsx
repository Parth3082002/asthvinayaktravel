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
  BackHandler
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

  // Handle Razorpay payment
  const handleRazorpayPayment = (payAmount) => {
    // Validate inputs before payment
    if (!validateInputs()) {
      return;
    }

    const options = {
      description: 'Car Booking Payment',
      image: 'https://your-logo-url.png', // Change to your logo
      currency: 'INR',
      key: 'rzp_live_DGlzWoiGqqLg0A', // Updated with client's live key
      amount: (parseInt(payAmount) * 100).toString(), // Amount in paise
      name: 'Ashtavinayak Holidays', // Company name
      prefill: {
        email: user?.email || "customer@ashtavinayak.com",
        contact: user?.phoneNumber || mobileNo || "9999999999",
        name: user?.userName || "Guest User",
      },
      theme: { color: '#D44206' }
    };
  
    RazorpayCheckout.open(options)
      .then((data) => {
        // Payment Success
        Alert.alert(
          "Payment Successful",
          `Payment ID: ${data.razorpay_payment_id}`,
          [
            {
              text: "OK",
              onPress: () => handleBooking(data.razorpay_payment_id), // Pass payment ID to booking function
            },
          ]
        );
      })
      .catch((error) => {
        // Payment Failure
        console.error("Razorpay Error:", error);
        Alert.alert(
          "Payment Failed",
          `${error.code} | ${error.description}`
        );
      });
  };

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
  
    if (numericValue < totalAmount / 2) {
      setErrorMessage(`Advance amount should be at least ₹${totalAmount / 2}`);
    } else {
      setErrorMessage("");
    }
  };
  
  // Handle child without seat input
  const handleTextChange = (text) => {
    if (!isAlertShown) {
      Alert.alert(
        "Additional Charge",
        `Child without seat cost: ₹${childWithoutSeatP} per person. This amount will be added to your total.`,
        [{ text: "OK", onPress: () => setIsAlertShown(true) }]
      );
    }
    setChildWithoutSeat(text);
  };

  // Handle booking submission
  const handleBooking = async (paymentId = null) => {
    if (!validateInputs()) {
      return;
    }

    if (!user || !user.userId || !token) {
      Alert.alert("Error", "User not found. Please log in again.");
      return;
    }
  
    // Combine date and time into a valid DateTime format
    const combinedDateTime = new Date(`${date}T${time}`);
  
    // Prepare booking data
    const bookingPayload = {
      carType: carTypeLabel,
      date,
      time: combinedDateTime.toISOString(),
      userId: user.userId,
      pickupPointId: selectedPickupPointId,
      droppoint,
      roomType,
      status: "Confirmed",
      totalPayment: totalAmount,
      advance: advanceAmount,
      // Add fields for passenger counts
      adults: parseInt(adults) || 0,
      childWithSeat: parseInt(childWithSeat) || 0,
      childWithoutSeat: parseInt(childWithoutSeat) || 0,
      paymentId: paymentId // Add payment ID from Razorpay
    };
  
    try {
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
  
      const responseData = await response.json();
  
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
        console.error("API Error:", responseData);
        Alert.alert(
          "Booking Failed",
          responseData.title || "Something went wrong. Try again."
        );
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Error", "Network error. Please try again.");
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
            onPress={() => handleRazorpayPayment(totalAmount)}
          >
            <Text style={styles.payButtonText}>Pay Full</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, styles.payAdvanceButton]}
              onPress={() => handleRazorpayPayment(advanceAmount)}
            >
              <Text style={styles.buttonText}>Pay Advance</Text>
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
          {errors.seatCount && (
            <Text style={styles.errorText}>{errors.seatCount}</Text>
          )}

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
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: "#D44206", paddingVertical: 15, paddingHorizontal: 20, marginTop: 40, justifyContent: "center" },
  backButtonContainer: { marginRight: 10 },
  backButtonCircle: { backgroundColor: '#FFFFFF', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4, marginTop: 5, marginLeft: -115 },
  backButton: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  formContainer: { padding: 20 },
  card: { backgroundColor: "#FFFFFF", padding: 20, borderRadius: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  label: { fontSize: 14, marginBottom: 5, color: "#333", fontWeight: "500" },
  errorText: { color: 'red', fontSize: 14, marginTop: 5 },
  infoText: { color: '#555', fontSize: 12, marginTop: 5, fontStyle: 'italic' },
  input: { backgroundColor: "#fff", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#ddd", width: "100%", marginBottom: -6 },
  pickerContainer: { backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#ddd", height: 45 },
  button: { backgroundColor: "#D44206", paddingVertical: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
  buttonText: { color: "#fff", fontSize: 16 },
  payFullButton: { backgroundColor: "#0D9F28" },
  payAdvanceButton: { backgroundColor: "#3B8FC8", flex: 1 },
  inputFieldContainer: { marginVertical: 10 },
  advanceInput: { width: "30%" },
  nonEditableInput: {
    backgroundColor: "#f0f0f0",
    color: "#aaa",
  },
  paymentIconsContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
  icon: { width: 50, height: 50, resizeMode: "contain" },
  payButton: { backgroundColor: "#D44206", paddingVertical: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
  payButtonText: { color: "#fff", fontSize: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, display: 'flex', gap: 10 },
  halfWidth: { flex: 5, marginLeft: 2, marginRight: 1 },
  halfInputContainer: { flex: 1, marginRight: 10 },
  inputWithoutPadding: { flex: 1, padding: 0, marginLeft: 5 },
  inputFieldContainer: { marginBottom: 15 },
  nonEditableInput: { backgroundColor: "#e0e0e0", color: "#888" },
  inputWithIcon: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingLeft: 5, height: 44, borderRadius: 8, borderWidth: 1, borderColor: "#ddd" },
  datePickerText: { marginLeft: 10, fontSize: 16 },
  halfInputContainer: { width: "48%" },
  button: { borderRadius: 8, alignItems: "center", marginBottom: 15 },
  payFullButton: { backgroundColor: "#FFCA63", width: 100, height: 45, marginTop: 20, padding: 10 },
  payAdvanceButton: { backgroundColor: "#7CF7FF", width: 130, height: 45, padding: 10 },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  advanceInput: { marginLeft: -30, width: "40%", height: "75%" },
  paymentIconsContainer: { flexDirection: "row", justifyContent: "center", marginTop: 0 },
  icon: { width: 70, height: 70, marginHorizontal: 10, resizeMode: "contain" },
  payNowButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#FF5722', borderRadius: 5, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  buttonText1: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  label: { fontSize: 15, fontWeight: 'semibold', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, fontSize: 16, backgroundColor: '#fff' },
  nonEditableInput: { backgroundColor: '#f0f0f0', color: '#666' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, backgroundColor: '#fff', paddingVertical: 2 },
  picker: { height: 50, width: '100%', marginBottom: 0 }
});

export default CarBook;