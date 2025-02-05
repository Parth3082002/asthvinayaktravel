import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Button,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons"; // For the date icon

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

          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} keyboardType="email-address" />

          <Text style={styles.label}>Contact</Text>
          <TextInput style={styles.input} keyboardType="numeric" />

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ConfirmDetails")}
          >
            <Text style={styles.buttonText}>Next</Text>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
    fontWeight: "500",
    marginTop:-2,

  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  stepperButton: {
    backgroundColor: "#FF6F00",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperText: {
    marginTop:20,
    color: "#fff",
    fontWeight: "bold",
  },
  stepperValue: {
    marginHorizontal: 15,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom:5,
    height:45,
  },
  datePicker: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
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
  halfWidth: {
    width: "48%",
  },
});

export default SeatDetailsPage;
