import React, { useState, useEffect } from "react";
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';
import PaymentScreen from "./PaymentScreen";
const Book = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Razorpay Keys - Directly integrated in the code
  // Use these for development/testing
  const RAZORPAY_KEY_ID = 'rzp_test_AiL3OYgdBPKEeu';
  const RAZORPAY_KEY_SECRET = 'dRNtUmxCFSqA8mBIuOJjNmR9';

  // For production, uncomment these lines and comment out the test keys above
  // const RAZORPAY_KEY_ID = 'rzp_live_DGlzWoiGqqLg0A';
  // const RAZORPAY_KEY_SECRET = 'your_live_secret_key_here';

  // Add default values to prevent undefined errors
  const {
    cityName = "",
    cityId = 0,
    packageName = "",
    packageId = 0,
    categoryName = "",
    categoryId = 0,
    selectedPickupPoint = "",
    selectedPickupPointId = 0,
    price = 0,
    vehicleType = "",
    childWithSeatP = 0,
    childWithoutSeatP = 0,
    tripDate = "",
    tripId = 0,
    tourName = "",
    selectedSeats = [],
    selectedDate = new Date().toLocaleDateString()
  } = route.params || {};

  // State hooks
  const [date, setDate] = useState(selectedDate || new Date().toLocaleDateString());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(selectedPickupPoint || "");
  const [totalAmount, setTotalAmount] = useState(price ? price.toString() : "0");
  const [advanceAmount, setAdvanceAmount] = useState(price ? (price / 2).toString() : "0");
  const [mobileNo, setMobileNo] = useState(null);
  const [isAlertShown, setIsAlertShown] = useState(false);
  const [droppoint, setDroppoint] = useState('');
  const [adults, setAdults] = useState("");
  const [childWithSeat, setChildWithSeat] = useState("");
  const [childWithoutSeat, setChildWithoutSeat] = useState("");
  const [errors, setErrors] = useState({});
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [totalSeats, setTotalSeats] = useState(0);
  const [totalPersons, setTotalPersons] = useState(0);
  const [availableRoomTypes, setAvailableRoomTypes] = useState(["shared"]);
  const [roomType, setRoomType] = useState("shared");
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Calculate total seats from selectedSeats array
  useEffect(() => {
    if (Array.isArray(selectedSeats)) {
      setTotalSeats(selectedSeats.length);
    }
  }, [selectedSeats]);

  // Fetch user data from AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedMobileNo = await AsyncStorage.getItem("mobileNo");
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedMobileNo && storedToken && storedUser) {
          const userObj = JSON.parse(storedUser);
          setMobileNo(storedMobileNo);
          setToken(storedToken);
          setUser(userObj);
        } else {
          console.log("No data found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error retrieving data:", error);
      }
    };
    fetchUserData();
  }, []);

  // Check if total persons exceed booked seats
  useEffect(() => {
    const totalBookedPersons = (parseInt(adults) || 0) + (parseInt(childWithSeat) || 0);

    if (totalBookedPersons > totalSeats && totalSeats > 0) {
      Alert.alert("Warning", "Total persons exceed booked seats.", [
        {
          text: "OK",
          onPress: () => {
            if (parseInt(adults) > totalSeats) {
              setAdults("");
            } else {
              setChildWithSeat("");
            }
          },
        },
      ]);
    }

    setTotalPersons(totalBookedPersons + (parseInt(childWithoutSeat) || 0));
  }, [adults, childWithSeat, totalSeats]);

  const handleConfirm = (date) => {
    const formattedDate = date.toLocaleDateString();
    setDate(formattedDate);
    setDatePickerVisibility(false);
  };

  // Calculate total price based on selections
  const calculatePrice = () => {
    // Guard against NaN values
    const basePrice = parseFloat(price) || 0;
    const childWithSeatPrice = parseFloat(childWithSeatP) || 0;
    const childWithoutSeatPrice = parseFloat(childWithoutSeatP) || 0;

    let finalPrice = totalSeats * basePrice;
    const childWithSeatCost = (basePrice - childWithSeatPrice) * (parseInt(childWithSeat) || 0);
    const childWithoutSeatCost = (parseInt(childWithoutSeat) || 0) * childWithoutSeatPrice;

    finalPrice = finalPrice - childWithSeatCost + childWithoutSeatCost;

    const totalPersonsCount = (parseInt(adults) || 0) + (parseInt(childWithSeat) || 0) + (parseInt(childWithoutSeat) || 0);
    setTotalPersons(totalPersonsCount);

    // Dynamically set room type options
    if (totalPersonsCount >= 4) {
      setAvailableRoomTypes(["shared", "family"]);
    } else {
      setAvailableRoomTypes(["shared"]);
      setRoomType("shared");
    }

    if (totalPersonsCount >= 4 && roomType === "family") {
      finalPrice += totalPersonsCount * 500;
    }

    // Ensure values are valid numbers before setting state
    setTotalAmount(isNaN(finalPrice) ? "0" : finalPrice.toString());
    setAdvanceAmount(isNaN(finalPrice) ? "0" : (finalPrice / 2).toString());
  };

  // Trigger price calculation when relevant fields change
  useEffect(() => {
    calculatePrice();
  }, [adults, childWithSeat, childWithoutSeat, roomType, totalSeats, price, childWithSeatP, childWithoutSeatP]);

  // Validate advance amount input
  const handleAdvanceInputChange = (value) => {
    const numericValue = parseFloat(value) || 0;
    setAdvanceAmount(value);

    const minAdvance = parseFloat(totalAmount) / 2;
    if (numericValue < minAdvance) {
      setErrorMessage(`Advance amount should be at least ₹${minAdvance.toFixed(2)}`);
    } else {
      setErrorMessage("");
    }
  };

  // Handle child without seat info
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

  // Improved payment function that works with expo-razorpay
  const handlePayment = async (amount, isAdvancePayment = false) => {
    // Validate fields first
    if (!validateFields()) {
      return false;
    }
  
    // Check if user exists
    if (!user || !user.userId || !token) {
      Alert.alert("Error", "User not found. Please log in again.");
      return false;
    }
  
    setPaymentProcessing(true);
  
    try {
      // Convert amount to paisa (Razorpay uses the smallest currency unit)
      const amountInPaisa = Math.round(parseFloat(amount) * 100);
      
      const options = {
        description: isAdvancePayment ? 'Advance Payment for Tour Booking' : 'Full Payment for Tour Booking',
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: 'INR',
        key: RAZORPAY_KEY_ID,
        amount: amountInPaisa,
        name: 'Ashtavinayak Tours',
        prefill: {
          email: user.email || '',
          contact: user.phoneNumber || '',
          name: user.userName || ''
        },
        theme: { color: '#D44206' }
      };
  
      // For all platforms, use WebView approach as a reliable fallback
      navigation.navigate("PaymentScreen", {
        amount,
        isAdvancePayment,
        userId: user?.userId,
        userName: user?.userName,
        email: user?.email,
        phone: user?.phoneNumber,
        tripId,
        pickupPointId: selectedPickupPointId,
        droppoint,
        bookingDate: date,
        seatNumbers: selectedSeats,
        adults: parseInt(adults) || 0,
        roomType,
        childWithSeat: parseInt(childWithSeat) || 0,
        childWithoutSeat: parseInt(childWithoutSeat) || 0,
        totalAmount: parseFloat(totalAmount),
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

  // iOS-specific payment handling using WebView approach
  const handleIOSPayment = (amount, isAdvancePayment) => {
    setPaymentProcessing(false);

    // Navigate to separate PaymentScreen with necessary props
    navigation.navigate("PaymentScreen", {
      amount,
      isAdvancePayment,
      userId: user?.userId,
      userName: user?.userName,
      email: user?.email,
      phone: user?.phoneNumber,
      tripId,
      pickupPointId: selectedPickupPointId,
      droppoint,
      bookingDate: date,
      seatNumbers: selectedSeats,
      adults: parseInt(adults) || 0,
      roomType,
      childWithSeat: parseInt(childWithSeat) || 0,
      childWithoutSeat: parseInt(childWithoutSeat) || 0,
      totalAmount: parseFloat(totalAmount),
      razorpayKeyId: RAZORPAY_KEY_ID, // Pass the key directly to PaymentScreen
      onPaymentComplete: (paymentId) => {
        // This will be called by the PaymentScreen after successful payment
        processBooking(parseFloat(amount), paymentId);
      }
    });
  };

  // Simulate payment when Razorpay fails or for testing
  const simulatePayment = (amount, isAdvancePayment) => {
    Alert.alert(
      "Payment Simulation Mode",
      `Would you like to simulate a payment of ₹${amount}?`,
      [
        {
          text: "Yes, Process Payment",
          onPress: async () => {
            const mockPaymentId = "sim_" + Math.random().toString(36).substring(2, 15);
            await processBooking(parseFloat(amount), mockPaymentId);
          }
        },
        {
          text: "Cancel",
          onPress: () => setPaymentProcessing(false)
        }
      ]
    );
  };

  // Payment button handlers
  const handlePayFull = () => {
    handlePayment(totalAmount, false);
  };

  const handlePayAdvance = () => {
    const minAdvance = parseFloat(totalAmount) / 2;
    if (parseFloat(advanceAmount) < minAdvance) {
      setErrorMessage(`Advance amount should be at least ₹${minAdvance.toFixed(2)}`);
      return;
    }
    handlePayment(advanceAmount, true);
  };

  // Process booking after successful payment
  const processBooking = async (paidAmount, paymentId) => {
    // Safety checks for null/undefined values
    if (!route.params || !route.params.tripId) {
      setPaymentProcessing(false);
      Alert.alert("Error", "Trip information is missing.");
      return;
    }

    // Ensure numeric values are properly parsed
    const userIdValue = user && user.userId ? parseInt(user.userId) : 0;
    const tripIdValue = parseInt(route.params.tripId) || 0;
    const pickupPointIdValue = parseInt(route.params.selectedPickupPointId) || 0;

    const bookingData = {
      UserId: userIdValue,
      TripId: tripIdValue,
      PickupPointId: pickupPointIdValue,
      Droppoint: droppoint.trim(),
      BookingDate: new Date(route.params.selectedDate || new Date()).toISOString(),
      Status: "Confirmed",
      TotalPayment: parseFloat(totalAmount) || 0,
      Advance: paidAmount || 0,
      SeatNumbers: Array.isArray(selectedSeats) ? selectedSeats.map(seat => (seat.seatNumber || seat).toString()) : [],
      Adults: parseInt(adults) || 0,
      roomType: roomType || "shared",
      Childwithseat: parseInt(childWithSeat) || 0,
      Childwithoutseat: parseInt(childWithoutSeat) || 0,
      PaymentId: paymentId || "", 
      PaymentStatus: "Completed"
    };

    try {
      const response = await fetch(
        "https://ashtavinayak.somee.com/api/Booking/CreateBookingWithSeats",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bookingData),
        }
      );

      setPaymentProcessing(false);

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        
        if (response.ok) {
          Alert.alert("Success", "Booking successful!", [
            {
              text: "OK",
              onPress: async () => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Home" }],
                  })
                );
              },
            },
          ]);
        } else {
          const errorMessage = result.message || "Booking failed. Please try again.";
          Alert.alert("Booking Failed", errorMessage);
        }
      } else {
        // Handle non-JSON response
        if (response.ok) {
          Alert.alert("Success", "Booking successful!", [
            {
              text: "OK",
              onPress: async () => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Home" }],
                  })
                );
              },
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

  // Validation function to check required fields
  const validateFields = () => {
    let valid = true;
    const newErrors = {};

    if (!route?.params?.tripId) {
      newErrors.trip = "Trip information is missing";
      valid = false;
    }

    if (!route?.params?.selectedPickupPointId) {
      newErrors.pickup = "Pickup point is required";
      valid = false;
    }

    if (!droppoint) {
      newErrors.droppoint = "Drop location is required";
      valid = false;
    }

    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      newErrors.amount = "Total amount is missing";
      valid = false;
    }

    if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      newErrors.seats = "No seats selected";
      valid = false;
    }

    if (!adults && !childWithSeat) {
      newErrors.passengers = "Please enter number of adults or children with seat";
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
    }

    return valid;
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonContainer}
        >
          <View style={styles.backButtonCircle}>
            <Text style={styles.backButton}>{'<'}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerText}>Seat Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={styles.card}>
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

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Seat No</Text>
              <TextInput
                style={[styles.input, !isEditable && styles.nonEditableInput]}
                keyboardType="numeric"
                value={Array.isArray(selectedSeats) ? selectedSeats.map(seat => seat.seatNumber || seat).join(", ") : ""}
                editable={false}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Adult</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={adults}
                onChangeText={(text) => setAdults(text)}
              />
              {errors.adults && <Text style={styles.errorText}>{errors.adults}</Text>}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Child (With Seat)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={childWithSeat}
                onChangeText={(text) => setChildWithSeat(text)}
              />
              {errors.childWithSeat && <Text style={styles.errorText}>{errors.childWithSeat}</Text>}
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

          <View style={styles.inputFieldContainer}>
            <Text style={styles.label}>Room Type:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={roomType}
                onValueChange={(itemValue) => setRoomType(itemValue)}
                style={styles.picker}
              >
                {availableRoomTypes.map((type) => (
                  <Picker.Item key={type} label={type.charAt(0).toUpperCase() + type.slice(1)} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Journey Date</Text>
              <TouchableOpacity
                onPress={() => isEditable && setDatePickerVisibility(true)}
                style={[
                  styles.datePicker,
                  !isEditable && styles.nonEditableInput,
                ]}
                disabled={!isEditable}
              >
                <Text style={{ color: date !== "dd-MM-yyyy" ? "#333" : "#aaa" }}>
                  {date}
                </Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={() => setDatePickerVisibility(false)}
              />
            </View>
          </View>

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
                  onChangeText={(text) => setPickupLocation(text)}
                  editable={isEditable}
                />
              </View>
              {errors.pickupLocation && <Text style={styles.errorText}>{errors.pickupLocation}</Text>}
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
                  onChangeText={(text) => setDroppoint(text)}
                />
              </View>
              {errors.droppoint && <Text style={styles.errorText}>{errors.droppoint}</Text>}
            </View>
          </View>

          {/* Total Amount */}
          <View style={styles.inputFieldContainer}>
            <Text style={styles.label}>Total Amount</Text>
            <TextInput
              style={[styles.input, !isEditable && styles.nonEditableInput]}
              keyboardType="numeric"
              value={totalAmount ? totalAmount.toString() : ''}
              placeholder="Total Amount"
              placeholderTextColor="#aaa"
              editable={false}
            />
          </View>

          {/* Payment Options */}
          <TouchableOpacity 
            style={[styles.button, styles.payFullButton, paymentProcessing && styles.disabledButton]}
            onPress={handlePayFull}
            disabled={paymentProcessing}
          >
            <Text style={styles.buttonText}>Pay Full ₹{totalAmount}</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.button, styles.payAdvanceButton, paymentProcessing && styles.disabledButton]}
              onPress={handlePayAdvance}
              disabled={paymentProcessing}
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

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          {errors.seatCount && <Text style={styles.errorText}>{errors.seatCount}</Text>}

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
            <Image 
              source={{ uri: 'https://razorpay.com/assets/razorpay-glyph.svg' }}
              style={styles.icon}
            />
          </View>

          {paymentProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#D44206" />
              <Text style={styles.processingText}>Processing payment...</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D44206",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 40 : 0,
    justifyContent: "center",
  },
  backButtonContainer: {
    position: 'absolute',
    left: 20,
  },
  backButtonCircle: {
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  formContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
    fontWeight: "500",
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "100%",
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
  },
  picker: {
    height: 44,
  },
  datePicker: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#D44206",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  payFullButton: {
    backgroundColor: "#0D9F28",
  },
  payAdvanceButton: {
    backgroundColor: "#3B8FC8",
    flex: 1,
    marginRight: 10,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  inputFieldContainer: {
    marginVertical: 8,
  },
  advanceInput: {
    flex: 1,
  },
  paymentIconsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: 4,
  },
  halfInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  
  inputWithoutPadding: {
    flex: 1,
    padding: 0,
    marginLeft: 5,
  },
  nonEditableInput: {
    backgroundColor: "#f0f0f0",
    color: "#666",
  },inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
  },
  processingContainer: {
    alignItems: "center",
    marginTop: 20,
    padding: 10,
  },
  processingText: {
    marginTop: 10,
    color: "#D44206",
    fontSize: 16,
  },
});

export default Book;