import React, { useState } from "react";
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

const SeatDetailsPage = () => {
  const [date, setDate] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [roomType, setRoomType] = useState("");
  const [childWithSeat, setChildWithSeat] = useState(0);
  const [childWithoutSeat, setChildWithoutSeat] = useState(0);
  const navigation = useNavigation(); // Navigation hook

  const handleConfirm = (selectedDate) => {
    const formattedDate = selectedDate.toISOString().split("T")[0];
    setDate(formattedDate);
    setDatePickerVisibility(false);
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
                      />
                    </View>
            
                    <View style={styles.inputFieldContainer}>
                      <Text style={styles.label}>Contact Number</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Your Contact"
                        keyboardType="numeric"
                        placeholderTextColor="#aaa"
                      />
                    </View>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Seat No</Text>
              <TextInput style={styles.input} keyboardType="numeric" />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Adult</Text>
              <TextInput style={styles.input} keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Child (3 to 8 Yrs) (With Seat)</Text>
              <TextInput style={styles.input} keyboardType="numeric" />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Child (3 to 8 Yrs) (Without Seat)</Text>
              <TextInput style={styles.input} keyboardType="numeric" />
            </View>
          </View>

          {/* Room Type and Journey Date in one row */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Room Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={roomType}
                  onValueChange={(itemValue) => setRoomType(itemValue)}
                >
                  <Picker.Item label="Select Room Type" value="" />
                  <Picker.Item label="Single" value="Single" />
                  <Picker.Item label="Double" value="Double" />
                  <Picker.Item label="Suite" value="Suite" />
                </Picker>
              </View>
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Journey Date</Text>
              <TouchableOpacity
                onPress={() => setDatePickerVisibility(true)}
                style={[styles.datePicker, styles.inputWithIcon]}
              >
                <Text style={{ color: date ? "#333" : "#aaa" }}>
                  {date || "dd-MM-yyyy"}
                </Text>
                <Ionicons name="calendar" size={20} color="#333" />
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
                  placeholder="Pickup Location"
                  placeholderTextColor="#aaa"
                />
              </View>
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

           <View style={styles.inputFieldContainer}>
                    <Text style={styles.label}>Total Amount</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="Total Amount"
                      placeholderTextColor="#aaa"
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
                    />
                  </View>
          
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
          
                  <TouchableOpacity style={styles.payNowButton}>
                    <Text style={styles.buttonText1}>Pay Now</Text>
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

export default SeatDetailsPage;
