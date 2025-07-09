import React, { useState, useEffect, useCallback } from "react";
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
  ActivityIndicator,
  BackHandler
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute, CommonActions, useFocusEffect } from '@react-navigation/native';
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';
import PaymentScreen from "./PaymentScreen";
const Book = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Razorpay Keys - Directly integrated in the code
  // Use these for development/testing
  const RAZORPAY_KEY_ID = 'rzp_test_SqJODX06AyCHj3';
  const RAZORPAY_KEY_SECRET = 'MXmpWdb28AdoOLWw3Vexsw0Q';

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
    selectedVehicleId = 0,
    selectedBus = false,
    childWithSeatP = 0,
    childWithoutSeatP = 0,
    destinationId = "",
    destinationName = "",
    tuljapur = false,
    tripDate = selectedDate,
    tripId = 0,
    tourName = "",
    userName,
    selectedSeats = [],
    selectedDate
  } = route.params || {};

  // State hooks
  const [date, setDate] = useState(selectedDate);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(selectedPickupPoint || "");
  const [totalAmount, setTotalAmount] = useState(price ? price.toString() : "0");
  const [advanceAmount, setAdvanceAmount] = useState(price ? (price / 2).toString() : "0");
  const [mobileNo, setMobileNo] = useState(null);
  const [isAlertShown, setIsAlertShown] = useState(false);
  const [droppoint, setDroppoint] = useState(selectedPickupPoint || "");
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

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        navigation.navigate("SelectSeats", {
          cityName,
          cityId,
          packageName,
          packageId,
          categoryName,
          categoryId,
          selectedPickupPoint,
          selectedPickupPointId,
          price,
          vehicleType,
          selectedVehicleId,
          selectedBus,
          childWithSeatP,
          childWithoutSeatP,
          destinationId,
          destinationName,
          tuljapur,
          userName,
          selectedDate,
          tripId,
          tourName,
          totalBusSeats: selectedSeats.length
        });
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [navigation])
  );

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
      console.log("user?.userId ================ ",user?.userId);
      // For all platforms, use WebView approach as a reliable fallback
      const carPayment = false;
      navigation.navigate("PaymentScreen", {
        amount,
        carPayment,
        isAdvancePayment,
        userId: user?.userId,
        userName: user?.userName,
        email: user?.email,
        phone: user?.phoneNumber,
        tripId,
        pickupPointId: selectedPickupPointId,
        droppoint,
        seatNumbers: selectedSeats,
        adults: parseInt(adults) || 0,
        roomType,
        childWithSeat: parseInt(childWithSeat) || 0,
        childWithoutSeat: parseInt(childWithoutSeat) || 0,
        totalAmount: parseFloat(totalAmount),
        razorpayKeyId: RAZORPAY_KEY_ID,
        carType: selectedBus ? "" : "Car",
        categoryId,
        packageId,
        cityId,
        selectedDate,
        roomType: roomType || "shared",
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
          onPress={() => 
            navigation.navigate("SelectSeats", {
              cityName,
              cityId,
              packageName,
              packageId,
              categoryName,
              categoryId,
              selectedPickupPoint,
              selectedPickupPointId,
              price,
              vehicleType,
              selectedVehicleId,
              selectedBus,
              childWithSeatP,
              childWithoutSeatP,
              destinationId,
              destinationName,
              tuljapur,
              userName,
              selectedDate,
              tripId,
              tourName,
              totalBusSeats: selectedSeats.length
            })
          }
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
              <View
                style={[
                  styles.inputWithIcon,
                  !isEditable && styles.nonEditableInput,
                ]}
              >
                <Icon name="location-outline" size={20} color="#555" />
                <TextInput
                  style={styles.inputWithoutPadding}
                  value={droppoint}
                  placeholder="Drop Location"
                  placeholderTextColor="#aaa"
                  onChangeText={(text) => setDroppoint(text)}
                  editable={isEditable}
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
    backgroundColor: "#F9FAFB",
    marginTop: 30,
    marginBottom:40
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D44206",
    paddingVertical: 18,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    fontSize: 22,
    color: '#1E40AF',
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  formContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#1F2937",
    fontWeight: "500",
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginTop: 4,
  },
  input: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    width: "100%",
    marginBottom: 12,
  },
  nonEditableInput: {
    backgroundColor: "#E5E7EB",
    color: "#6B7280",
  },
  pickerContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  picker: {
    height: 55,
  },
  datePicker: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: 4,
  },
  halfInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  inputWithoutPadding: {
    flex: 1,
    padding: 0,
    marginLeft: 8,
    fontSize: 14,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  payFullButton: {
    backgroundColor: "#10B981",
  },
  payAdvanceButton: {
    backgroundColor: "#3B82F6",
    flex: 1,
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  advanceInput: {
    flex: 1,
    marginTop:25,
    backgroundColor: "#F3F4F6",
    // padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  paymentIconsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
  },
  icon: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  processingContainer: {
    alignItems: "center",
    marginTop: 20,
    padding: 10,
  },
  processingText: {
    marginTop: 10,
    color: "#1E40AF",
    fontSize: 16,
  },
});


export default Book;