import React, { useState, useEffect } from "react";
import { Alert } from "react-native"; // Import Alert
import { CommonActions } from '@react-navigation/native';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons"; // For the date icon
import Icon from "react-native-vector-icons/Ionicons"; // For icons
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from "@react-navigation/native";

const Book = () => {
  const [roomType, setRoomType] = useState("");
  const navigation = useNavigation(); // Navigation hook
  const route = useRoute(); // To access route params
  const [date, setDate] = useState(route.params.selectedDate || "dd-MM-yyyy");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(route.params.selectedPickupPoint || "");
  const [totalAmount, setTotalAmount] = useState(route.params.price || ""); // Ensure route.params.price is correct
  const [mobileNo, setMobileNo] = useState(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [advanceAmount, setAdvanceAmount] = useState(totalAmount / 2); // Dynamic initial value
  const [errorMessage, setErrorMessage] = useState("");
  const selectedSeats = route.params.selectedSeats.map(seat => seat.seatNumber || seat);
  const [seatNumber, setSeatNumber] = useState("");
  const [adults, setAdults] = useState(""); // Manual input
  const [childWithSeat, setChildWithSeat] = useState("");
  const [childWithoutSeat, setChildWithoutSeat] = useState("");
  const [errors, setErrors] = useState({}); // To store error messages for each field

  useEffect(() => {
    if (route?.params?.seatNumber) {
      setSeatNumber(route.params.seatNumber.toString()); // Ensuring it's a string
    }
  }, [route?.params?.seatNumber]); // Runs when seatNumber updates

  useEffect(() => {
    // Log passed parameters from SelectSeats
    console.log("Passed Data from SelectSeats:");
    console.log("City Name:", route.params.cityName);
    console.log("City ID:", route.params.cityId);
    console.log("Package Name:", route.params.packageName);
    console.log("Package ID:", route.params.packageId);
    console.log("Category Name:", route.params.categoryName);
    console.log("Category ID:", route.params.categoryId);
    console.log("Selected Pickup Point:", route.params.selectedPickupPoint);
    console.log("Price:", route.params.price);
    console.log("Selected Date:", route.params.selectedDate);
    console.log("Received Pickup Point ID:", route.params.selectedPickupPointId);
    console.log("Trip ID:", route.params.tripId);

    // Fetch user data from AsyncStorage
    const fetchUserData = async () => {
      try {
        const mobileNo = await AsyncStorage.getItem('mobileNo');
        const token = await AsyncStorage.getItem('token');
        const user = await AsyncStorage.getItem('user');

        if (mobileNo && token && user) {
          const userObj = JSON.parse(user);
          setMobileNo(mobileNo);
          setToken(token);
          setUser(userObj);

          // Print userId in console
          console.log("User ID:", userObj.userId);
        } else {
          Alert.alert('Error', 'No data found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error retrieving data from AsyncStorage:', error);
        Alert.alert('Error', 'Failed to load user data');
      }
    };

    fetchUserData();
  }, [route.params]);

  const handleAdvanceInputChange = (value) => {
    const numericValue = parseFloat(value);
    setAdvanceAmount(numericValue);

    if (numericValue < totalAmount / 2) {
      setErrorMessage(`Advance amount should be greater than ${totalAmount / 2}`);
    } else {
      setErrorMessage("");
    }
  };

  const handleConfirm = (date) => {
    const formattedDate = date.toLocaleDateString();  // Format the date
    setDate(formattedDate); // Update the date state
    setDatePickerVisibility(false);
  };

  const validateFields = () => {
    const newErrors = {};

    if (!adults) newErrors.adults = "field is required";
    if (!childWithSeat) newErrors.childWithSeat = "field is required";
    if (!childWithoutSeat) newErrors.childWithoutSeat = " field is required";
    // if (!pickupLocation) newErrors.pickupLocation = "Pickup location is required";

    // Validate seat count
    const totalSeats = parseInt(adults) + parseInt(childWithSeat) + parseInt(childWithoutSeat);
    if (totalSeats !== selectedSeats.length) {
      newErrors.seatCount = `Total seats (${selectedSeats.length}) do not match the sum of adults, children with seats, and children without seats.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBooking = async () => {
    if (!validateFields()) {
      return;
    }

    if (!user || !user.userId || !token) {
      Alert.alert("Error", "User not found. Please log in again.");
      return;
    }

    const bookingData = {
      UserId: user.userId,
      TripId: route.params.tripId,
      PickupPointId: route.params.selectedPickupPointId,
      DroppointId: route.params.selectedDropPointId || 1,
      BookingDate: new Date(route.params.selectedDate).toISOString(),
      Status: "Confirmed",
      TotalPayment: totalAmount,
      Advance: advanceAmount,
      SeatNumbers: selectedSeats.map(seat => seat.seatNumber || seat).map(String),
      Adults: parseInt(adults) || 0,
      Childwithseat: parseInt(childWithSeat) || 0,
      Childwithoutseat: parseInt(childWithoutSeat) || 0,
    };

    console.log("Booking Data:", JSON.stringify(bookingData, null, 2));

    try {
      const response = await fetch(
        "http://ashtavinayak.somee.com/api/Booking/CreateBookingWithSeats",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bookingData),
        }
      );

      const result = await response.json();
      console.log("API Response:", result);

      if (response.ok) {
        Alert.alert("Success", "Booking successful!", [
          {
            text: "OK",
            onPress: async () => {
              // Reset navigation stack and navigate to Home
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
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonContainer}>
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
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor="#aaa"
              value={user?.userName || ""} // Ensuring it doesn't break if user is null
              editable={false} // Making it non-editable if necessary
            />
          </View>

          <View style={styles.inputFieldContainer}>
            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Your Contact"
              keyboardType="numeric"
              placeholderTextColor="#aaa"
              value={user?.phoneNumber || ""}
              editable={false} // Prevent user modification if required
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Seat No</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={selectedSeats.map(seat => seat.seatNumber || seat).join(", ")} // Extract actual seat numbers
                editable={false} // Making it read-only
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
              <Text style={styles.label}>Child (3 to 8 Yrs) (With Seat)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={childWithSeat}
                onChangeText={(text) => setChildWithSeat(text)}
              />
              {errors.childWithSeat && <Text style={styles.errorText}>{errors.childWithSeat}</Text>}
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Child (3 to 8 Yrs) (Without Seat)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={childWithoutSeat}
                onChangeText={(text) => setChildWithoutSeat(text)}
              />
              {errors.childWithoutSeat && <Text style={styles.errorText}>{errors.childWithoutSeat}</Text>}
            </View>
          </View>

          {/* Room Type and Journey Date in one row */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Journey Date</Text>
              <TouchableOpacity
                onPress={() => setDatePickerVisibility(false)}
                style={[styles.datePicker, styles.inputWithIcon]}
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
              <View style={styles.inputWithIcon}>
                <Icon name="location-outline" size={20} color="#555" />
                <TextInput
                  style={styles.inputWithoutPadding}
                  value={pickupLocation}
                  placeholder="Pickup Location"
                  placeholderTextColor="#aaa"
                  onChangeText={(text) => setPickupLocation(text)}
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
                />
              </View>
            </View>
          </View>

          {/* Total Amount */}
          <View style={styles.inputFieldContainer}>
            <Text style={styles.label}>Total Amount</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={totalAmount ? totalAmount.toString() : ''}  // Ensure totalAmount is a string for display
              placeholder="Total Amount"
              placeholderTextColor="#aaa"
              editable={false} // If you do not want it to be editable, set editable to false
            />
          </View>

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
    marginTop: 20,
    justifyContent: "center",
  },
  backButtonContainer: {
    marginRight: 10,
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
    elevation: 4, // Adds shadow on Android
    marginTop:5,
    marginLeft:-115,
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
    color: 'red', // Red color for error messages
    fontSize: 14, // Adjust the font size if needed
    marginTop: 5, // Add some space above the error message
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "100%", // Ensures all inputs are the same width
    marginBottom:-6,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    height: 45,
  },
  datePicker: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button:{
    backgroundColor: "#D44206",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  payFullButton: {
    backgroundColor: "#0D9F28",
  },
  payAdvanceButton: {
    backgroundColor: "#3B8FC8",
    flex: 1,
  },
  inputFieldContainer: {
    marginVertical: 10,
  },
  advanceInput: {
    width: "30%",
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
  payNowButton: {
    backgroundColor: "#D44206",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText1: {
    color: "#fff",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    display: 'flex', // Ensure it's a flex container
    gap: 10, // Creates a gap between the fields in the same row
  },
  halfWidth: {
    flex: 5,
    marginLeft:2,
    marginRight:1,
  },
  
  
  halfInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  
  inputWithoutPadding: {
    flex: 1,
    padding: 0,
    marginLeft: 5,
  },


  inputFieldContainer: {
    marginBottom: 15,
    
  },
  
 
  
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingLeft: 5,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  datePickerText: {
    marginLeft: 10,
    fontSize: 16,
  },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
  halfInputContainer: {
    width: "48%",
  },
  button: {
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  payFullButton: {
    backgroundColor: "#FFCA63",
    width: 100,
    height:45,
    padding: 10,
  },
  payAdvanceButton: {
    backgroundColor: "#7CF7FF",
    width: 130,
    height:45,
    padding: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  advanceInput: {
    marginLeft: -30,
    width: "40%",
    height:"75%",
  },
  paymentIconsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 0,
  },
  icon: {
    width: 70,
    height: 70,
    marginHorizontal: 10,
    resizeMode: "contain",
  },
  payNowButton: {
    backgroundColor: "#FF6F00",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
    buttonText1: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "bold",
    },
  
});

export default Book;
