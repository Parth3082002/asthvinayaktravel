import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from "react-native-vector-icons/Ionicons"; // For icons
import { useNavigation } from '@react-navigation/native';

const ConfirmDetails = ({ }) => {
  const [date, setDate] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const navigation = useNavigation(); // Navigation hook

  const handleConfirm = (selectedDate) => {
    const formattedDate = selectedDate.toISOString().split("T")[0];
    setDate(formattedDate);
    setDatePickerVisibility(false);
  };

  return (
    <View style={styles.mainContainer}>
      {/* Back Arrow Outside ScrollView */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.navigate('BookingDetails')} style={styles.backButtonContainer}>
  <View style={styles.backButtonCircle}>
    <Text style={styles.backButton}>{'<'}</Text>
  </View>
</TouchableOpacity>
             <Text style={styles.headerText}>Confirm Details</Text>
           </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.container}>
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
          <Text style={styles.label}>Travel Date</Text>
          <TouchableOpacity
            onPress={() => setDatePickerVisibility(true)}
            style={styles.inputWithIcon}
          >
            <Icon name="calendar-outline" size={20} color="#555" />
            <Text
              style={[
                styles.datePickerText,
                { color: date ? "#333" : "#aaa" },
              ]}
            >
              {date || "Choose Date"}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={() => setDatePickerVisibility(false)}
          />
        </View>

        <View style={styles.inputFieldContainer}>
          <Text style={styles.label}>Total Adults</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Total Adults"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Total Child (With Seat)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Total Child"
              placeholderTextColor="#aaa"
            />
          </View>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Total Child (Without Seat)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Total Child"
              placeholderTextColor="#aaa"
            />
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
  mainContainer: {
    paddingTop: 10,
    flex: 1,
    backgroundColor: "#F5F5F5",
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
    marginBottom:40,
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
    marginLeft:-100,
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
  container: {
    flex: 1,
    padding: 20,
    
  },
  inputFieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
    marginTop:0,
  },
  input: {
    backgroundColor: "#fff",
    height: 50,
    paddingLeft: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputWithoutPadding: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    borderWidth: 0,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingLeft: 10,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  datePickerText: {
    marginLeft: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
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

export default ConfirmDetails;
