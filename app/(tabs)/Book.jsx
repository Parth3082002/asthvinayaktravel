import React, { useState, useEffect } from "react";
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons"; // For the date icon
import Icon from "react-native-vector-icons/Ionicons"; // For icons
import AsyncStorage from '@react-native-async-storage/async-storage';

const Book = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Extracting all params from route
  const {
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
    childWithSeatP,
    childWithoutSeatP,
    tripDate,
    tripId,
    tourName,
    selectedSeats = [],
    selectedDate
  } = route.params || {};

  // State hooks
  const [date, setDate] = useState(selectedDate || "dd-MM-yyyy");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(selectedPickupPoint || "");
  const [totalAmount, setTotalAmount] = useState(price || "");
  const [advanceAmount, setAdvanceAmount] = useState(price ? price / 2 : "");
  const [seatNumber, setSeatNumber] = useState("");
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
  const [totalSeats, setTotalSeats] = useState(0); // ✅ New State for Total Seats
  const [totalPersons, setTotalPersons] = useState(0); // For total persons calculation
  const [availableRoomTypes, setAvailableRoomTypes] = useState(["shared"]);
  const [roomType, setRoomType] = useState("shared");
  const [errorMessage, setErrorMessage] = useState("");

  // Log all the received parameters on component mount
  useEffect(() => {
    console.log("Passed Data from SelectSeats:");
    console.log("City Name:", cityName);
    console.log("City ID:", cityId);
    console.log("Package Name:", packageName);
    console.log("Package ID:", packageId);
    console.log("Category Name:", categoryName);
    console.log("Category ID:", categoryId);
    console.log("Selected Pickup Point:", selectedPickupPoint);
    console.log("Selected Pickup Point ID:", selectedPickupPointId);
    console.log("Price:", price);
    console.log("Vehicle Type:", vehicleType);
    console.log("Child With Seat Price:", childWithSeatP);
    console.log("Child Without Seat Price:", childWithoutSeatP);
    console.log("Trip Date:", tripDate);
    console.log("Trip ID:", tripId);
    console.log("Tour Name:", tourName);
    console.log("Selected Seats:", selectedSeats);
    console.log("Selected Date:", selectedDate);

    // ✅ Calculate Total Seats from selectedSeats array
    if (Array.isArray(selectedSeats)) {
      setTotalSeats(selectedSeats.length);
      console.log("Total Seats Selected:", selectedSeats.length);
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
          Alert.alert("Error", "No data found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error retrieving data:", error);
      }
    };
    fetchUserData();
  }, []);



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
    


    const handleConfirm = (date) => {
      const formattedDate = date.toLocaleDateString();  // Format the date
      setDate(formattedDate); // Update the date state
      setDatePickerVisibility(false);
    };

  // Calculate total price based on selections
  const calculatePrice = () => {
    let finalPrice = totalSeats * price; // ✅ (Seats * Price)
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

  // Trigger price calculation when relevant fields change
  useEffect(() => {
    calculatePrice();
  }, [adults, childWithSeat, childWithoutSeat, roomType, totalSeats]);

  // Validate advance amount input
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

    // Validation function to check required fields
    const validateFields = () => {
      if (
        !route?.params?.tripId ||
        !route?.params?.selectedPickupPointId ||
        !droppoint ||
        !totalAmount ||
        selectedSeats.length === 0
      ) {
        Alert.alert("Validation Error", "Please fill in all required fields.");
        return false;
      }
      return true;
    };
  
    console.log("Pay Now button clicked"); // To verify button press
  
    // Validate fields
    if (!validateFields()) {
      console.log("Validation failed");
      return;
    }
  
    // Check if user and token exist
    if (!user || !user.userId || !token) {
      Alert.alert("Error", "User not found. Please log in again.");
      return;
    }
  
    // Prepare booking data
    const bookingData = {
      UserId: parseInt(user.userId), // Ensure it's an integer
      TripId: parseInt(route.params.tripId),
      PickupPointId: parseInt(route.params.selectedPickupPointId),
      Droppoint: droppoint.trim(), // Trim to avoid extra spaces
      BookingDate: new Date(route.params.selectedDate).toISOString(), // Correct format
      Status: "Confirmed",
      TotalPayment: parseFloat(totalAmount), // Ensure float
      Advance: parseFloat(advanceAmount),    // Ensure float
      SeatNumbers: selectedSeats.map(seat => (seat.seatNumber || seat).toString()), // Ensure strings
      Adults: parseInt(adults) || 0,
      roomType: roomType || "", // RoomType field as per API
      Childwithseat: parseInt(childWithSeat) || 0,
      Childwithoutseat: parseInt(childWithoutSeat) || 0,
    };
  
    console.log("Prepared Booking Data:", JSON.stringify(bookingData, null, 2)); // Log booking data
  
    try {
      // API call
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
      console.log("API Response:", result); // Log API response
  
      if (response.ok) {
        // Success Alert
        Alert.alert("Success", "Booking successful!", [
          {
            text: "OK",
            onPress: async () => {
              // Navigate back to SelectVehicle1 after success
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "SelectVehicle1" }],
                })
              );
            },
          },
        ]);
      } else {
        // Handle API errors
        const errorMessage = result.message || "Booking failed. Please try again.";
        Alert.alert("Booking Failed", errorMessage);
      }
    } catch (error) {
      console.error("API Error:", error); // Log any errors
      Alert.alert("Error", "Something went wrong. Please try again.");
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
        <TouchableOpacity onPress={() => navigation.navigate('SelectVehicle1')} style={styles.backButtonContainer}>
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
  style={[styles.input, !isEditable && styles.nonEditableInput]} // Apply gray style if not editable
  placeholder="Your Name"
  placeholderTextColor="#aaa"
  value={user?.userName || ""}
  editable={isEditable} // Use the state
/>
          </View>

          <View style={styles.inputFieldContainer}>
            <Text style={styles.label}>Contact Number</Text>
            <TextInput
  style={[styles.input, !isEditable&& styles.nonEditableInput]}
  placeholder="Your Contact"
  keyboardType="numeric"
  placeholderTextColor="#aaa"
  value={user?.phoneNumber || ""}
  editable={false} // Explicitly set to false
/>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Seat No</Text>
              <TextInput
  style={[styles.input, !isEditable && styles.nonEditableInput]}
  keyboardType="numeric"
  value={selectedSeats.map(seat => seat.seatNumber || seat).join(", ")}
  editable={false} // Explicitly set to false
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
            {/* <View style={styles.halfWidth}>
              <Text style={styles.label}>Without Booking </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={childWithoutSeat}
                onChangeText={(text) => setChildWithoutSeat(text)}
              />
              {errors.childWithoutSeat && <Text style={styles.errorText}>{errors.childWithoutSeat}</Text>}
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
  <View style={styles.halfWidth}>
    <Text style={styles.label}>Journey Date</Text>
    <TouchableOpacity
      onPress={() => isEditable && setDatePickerVisibility(true)} // Allow clicking only if editable
      style={[
        styles.datePicker,
        styles.inputWithIcon,
        !isEditable && styles.nonEditableInput, // Apply gray background when not editable
      ]}
      disabled={!isEditable} // Disable touch if not editable
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
      !isEditable && styles.nonEditableInput, // Apply gray background when not editable
    ]}
  >
    <Icon name="location-outline" size={20} color="#555" />
    <TextInput
      style={styles.inputWithoutPadding}
      value={pickupLocation}
      placeholder="Pickup Location"
      placeholderTextColor="#aaa"
      onChangeText={(text) => setPickupLocation(text)}
      editable={isEditable} // Make non-editable when needed
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
</View>

          </View>

          {/* Total Amount */}
          <TextInput
  style={[styles.input, !isEditable && styles.nonEditableInput]}
  keyboardType="numeric"
  value={totalAmount ? totalAmount.toString() : ''}
  placeholder="Total Amount"
  placeholderTextColor="#aaa"
  editable={false} // Explicitly set to false
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
  payButton: {
    backgroundColor: "#D44206",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  payButtonText: {
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
  
   nonEditableInput: {
    backgroundColor: "#e0e0e0", // Gray background when not editable
    color: "#888", // Lighter text color to indicate it's disabled
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
    marginTop:20,
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
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FF5722',
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',

  },
    buttonText1: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "bold",
    },

    
  
});

export default Book;
