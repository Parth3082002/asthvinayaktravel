import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useNavigation } from '@react-navigation/native';

const SelectDateScreen = ({  }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const navigation = useNavigation();

  const dates = [
    "01/28/2025",
    "01/29/2025",
    "01/30/2025",
    "01/31/2025",
    "02/01/2025",
    "02/02/2025",
    "02/03/2025",
    "02/04/2025",
    "02/05/2025",
    "02/06/2025",
  ];

  const handleNextPress = () => {
    if (selectedDate) {
      console.log("Selected Date:", selectedDate);
      navigation.navigate("SelectSeats"); // Navigate to SelectSeats screen
    } else {
      alert("Please select a date");
    }
  };
  

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dateRow}
      onPress={() => setSelectedDate(item)}
    >
      <Text style={styles.dateText}>{item}</Text>
      <View
        style={[
          styles.radioCircle,
          selectedDate === item && styles.radioCircleSelected,
        ]}
      >
        {selectedDate === item && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonContainer}>
        <View style={styles.backButtonCircle}>
          <Text style={styles.backButton}>{'<'}</Text>
        </View>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.headerText}>Select Dates</Text>
      </View>

      {/* Date List */}
      <FlatList
        data={dates}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />

      {/* Next Button */}
      <TouchableOpacity
        style={[
          styles.nextButton,
          { backgroundColor: selectedDate ? "#FF5722" : "#e0e0e0" },
        ]}
        onPress={handleNextPress}
        disabled={!selectedDate}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
    
  },
  // backButton: {
  //   marginBottom: 16,
  // },
  // backButtonText: {
  //   color: "#FF5722",
  //   fontSize: 20,
  // },

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
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  listContainer: {
    marginTop:20,
    paddingHorizontal: 16,

    paddingBottom: 16,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  dateText: {
    fontSize: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  radioCircleSelected: {
    borderColor: "#FF5722",
  },
  radioInner: {
    width: 10,
    height: 10,
    backgroundColor: "#FF5722",
    borderRadius: 5,
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,

    borderRadius: 8,
    marginBottom: 20,
    width:'80%',
    alignItems: "center",
    marginLeft:40,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SelectDateScreen;
