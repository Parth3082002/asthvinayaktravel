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
// import { Picker } from "@react-native-picker/picker";
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from "@expo/vector-icons"; // For the date icon
import Icon from "react-native-vector-icons/Ionicons"; // For icons
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRoute } from "@react-navigation/native";


const CarBook = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Extract bookingData safely with default values
  const { bookingData } = route.params || {};

// Extract all values from bookingData
const {
  carType = 0,
  carTypeLabel,
  acType = "",
  childWithSeatP = 0,
  childWithoutSeatP = 0,
  price = 0,
  date, // Fetch date from bookingData
  time, // Fetch time from bookingData
  selectedPickupPointId,
  selectedPickupPoint,
  cityId,
  cityName,
  status = "Confirmed",
  vehicleType = "",
} = bookingData || {};

  // Total seats based on car type
  const totalSeats = carType;

  const [pickupLocation, setPickupLocation] = useState(
    route.params?.selectedPickupPoint || ""
  );
  const [droppoint, setDroppoint] = useState("");
  const [mobileNo, setMobileNo] = useState(null);
  const [token, setToken] = useState(null);
  // const bookingData = route.params?.bookingData || {};
    // const [date, setDate] = useState(bookingData.selectedDate || "dd-MM-yyyy");
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    // const [childWithoutSeat, setChildWithoutSeat] = useState("");
    const [isAlertShown, setIsAlertShown] = useState(false); // Track alert visibility
  const [user, setUser] = useState(null);
  const [roomType, setRoomType] = useState("shared");
  const [adults, setAdults] = useState("");
  const [childWithSeat, setChildWithSeat] = useState("");
  const [childWithoutSeat, setChildWithoutSeat] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [totalPersons, setTotalPersons] = useState(0);
  const [isEditable, setIsEditable] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});
  // const [roomType, setRoomType] = useState("shared");
  const [isChildWithoutSeatEditable, setIsChildWithoutSeatEditable] = useState(false);

  const [availableRoomTypes, setAvailableRoomTypes] = useState(["shared"]);

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
          Alert.alert("Error", "No data found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error retrieving data:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    calculatePrice();
  }, [adults, childWithSeat, childWithoutSeat, roomType]);

  useEffect(() => {
    const totalBookedPersons = (parseInt(adults) || 0) + (parseInt(childWithSeat) || 0);
  
    if (totalBookedPersons > totalSeats) {
      Alert.alert("Warning", "Total persons exceed booked seats.", [
        {
          text: "OK",
          onPress: () => {
            if (parseInt(adults) > totalSeats) {
              setAdults(""); // Clear only 'adults' field if it's the cause
            } else {
              setChildWithSeat(""); // Clear only 'childWithSeat' field if it's the cause
            }
          },
        },
      ]);
    }
  
    setTotalPersons(totalBookedPersons + (parseInt(childWithoutSeat) || 0));
  }, [adults, childWithSeat]);
  


  
  

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
  
  const calculatePrice = () => {
    let finalPrice = totalSeats * price; // (Seats * Price)
    const childWithSeatCost = (parseInt(childWithSeat) || 0) * childWithSeatP;
    const childWithoutSeatCost = (parseInt(childWithoutSeat) || 0) * childWithoutSeatP;

    finalPrice = finalPrice - childWithSeatCost + childWithoutSeatCost;

    const totalPersonsCount = (parseInt(adults) || 0) + (parseInt(childWithSeat) || 0) + (parseInt(childWithoutSeat) || 0);
    setTotalPersons(totalPersonsCount);

    // Dynamically set room type options
    if (totalPersonsCount >= 4) {
      setAvailableRoomTypes(["shared", "family"]); // Show both options
    } else {
      setAvailableRoomTypes(["shared"]); // Only shared room
      setRoomType("shared"); // Reset to shared if less than 4 persons
    }

    if (totalPersonsCount >= 4 && roomType === "family") {
      finalPrice += totalPersonsCount * 500; // (Total Persons * 500)
    }

    setTotalAmount(finalPrice);
    setAdvanceAmount(finalPrice / 2);
  };

  // Trigger calculation when person count changes
  useEffect(() => {
    calculatePrice();
  }, [adults, childWithSeat, childWithoutSeat, roomType]);


  const handleAdvanceInputChange = (value) => {
    const numericValue = parseFloat(value) || 0;
    setAdvanceAmount(numericValue);
  
    if (numericValue < totalAmount / 2) {
      setErrorMessage(`Advance amount should be at least ${totalAmount / 2}`);
    } else {
      setErrorMessage("");
    }
  };
  

  const handleBooking = async () => {

    if (!carTypeLabel) {
      alert('Please select a car type');
      return;
  }
    if (!user || !user.userId || !token) {
      Alert.alert("Error", "User not found. Please log in again.");
      return;
    }
  
    // Combine date and time into a valid DateTime format
    const combinedDateTime = new Date(`${date}T${time}`);
  
    // Prepare only the required booking data
    const bookingData = {
      carType: carTypeLabel,         // Example: "SUV"
      date,                                   // Example: "2024-02-20"
      time: combinedDateTime.toISOString(),   // Example: "2024-02-20T10:00:00"
      userId: user.userId,                    // Example: 1
      pickupPointId: route.params?.selectedPickupPointId,  // Example: 1
      droppoint,                              // Example: "Main Terminal"
      roomType,                               // Example: "Deluxe"
      status: "Confirmed",                    // Fixed value
      totalPayment: totalAmount,              // Example: 4000.00
      advance: advanceAmount,                 // Example: 3000.00
    };
  
    // console.log("Booking Data Sent:", bookingData);  // Log for debugging
  
    try {
      const response = await fetch(
        "https://ashtavinayak.somee.com/api/Booking/BookCar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bookingData),
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

  
    const handleTextChange = (text) => {
      if (!isAlertShown) {
        Alert.alert(
          "Additional Charge",
          `Child without seat cost: ₹${childWithoutSeatP} per person. This amount will be added to your total.`,
          [{ text: "OK", onPress: () => setIsAlertShown(true) }] // Show alert only once
        );
      }
      setChildWithoutSeat(text); // Update input field
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
          {/* <View style={styles.halfWidth}>
            <Text style={styles.label}>Without Booking</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={childWithoutSeat}
              onChangeText={setChildWithoutSeat}
            />
          </View> */}
          <View style={styles.halfWidth}>
      <Text style={styles.label}>Child (Without Seat)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={childWithoutSeat}
        onChangeText={handleTextChange} // Show alert when user enters text for the first time
      />
    </View>

        </View>

        <View style={styles.inputFieldContainer}>
  <Text style={styles.label}>Room Type:</Text>
  <View style={styles.inputWithIcon}>
    <Picker
      selectedValue={roomType}
      onValueChange={(itemValue) => setRoomType(itemValue)}
      style={{ flex: 1 }}
    >
      {availableRoomTypes.map((type) => (
        <Picker.Item key={type} label={type} value={type} />
      ))}
    </Picker>
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
          </View>
        </View>

        <Text style={styles.label}>Total Amount</Text>
        <TextInput
          style={[styles.input, !isEditable && styles.nonEditableInput]}
          value={totalAmount.toString()}
          editable={false}
        />

        <TouchableOpacity style={[styles.button, styles.payFullButton]}>
          <Text style={styles.buttonText}>Pay Full</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <TouchableOpacity style={[styles.button, styles.payAdvanceButton]}>
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

        <TouchableOpacity style={styles.payButton} onPress={handleBooking}>
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </View>
  );
};



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: "#D44206", paddingVertical: 15, paddingHorizontal: 20, marginTop: 20, justifyContent: "center" },
  backButtonContainer: { marginRight: 10 },
  backButtonCircle: { backgroundColor: '#FFFFFF', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4, marginTop: 5, marginLeft: -115 },
  backButton: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  formContainer: { padding: 20 },
  card: { backgroundColor: "#FFFFFF", padding: 20, borderRadius: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  label: { fontSize: 14, marginBottom: 5, color: "#333", fontWeight: "500" },
  errorText: { color: 'red', fontSize: 14, marginTop: 5 },
  input: { backgroundColor: "#fff", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#ddd", width: "100%", marginBottom: -6 },
  pickerContainer: { backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#ddd", height: 45 },
  datePicker: { backgroundColor: "#fff", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#ddd" },
  button: { backgroundColor: "#D44206", paddingVertical: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
  buttonText: { color: "#fff", fontSize: 16 },
  payFullButton: { backgroundColor: "#0D9F28" },
  payAdvanceButton: { backgroundColor: "#3B8FC8", flex: 1 },
  inputFieldContainer: { marginVertical: 10 },
  advanceInput: { width: "30%" },
  nonEditableInput: {
    backgroundColor: "#f0f0f0", // Light gray to indicate it's disabled
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
