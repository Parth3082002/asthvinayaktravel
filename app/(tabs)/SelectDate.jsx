import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const SelectDateScreen = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute(); // Access navigation params
  // const { selectedPickupPointId } = route.params || {};
  // Fetch dates from the API
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const response = await fetch(
          "http://ashtavinayak.somee.com/api/Trip"
        );
        const result = await response.json();
        if (result.data) {
          const formattedDates = result.data.map((trip) => trip.tripDate);
          setDates(formattedDates);
        }
      } catch (error) {
        console.error("Error fetching dates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDates();
  }, []);

  useEffect(() => {
    const backAction = () => {
      // Reset navigation stack and navigate back to Home
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
      return true; // Prevent default back action
    };

    // Add event listener for physical back button
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    // Clean up the event listener on component unmount
    return () => backHandler.remove();
  }, [navigation]);

  const handleNextPress = () => {
    if (selectedDate) {
      // Log all the received data along with the selected date
      console.log("Navigating with the following data:");
      console.log("City Name:", route.params.cityName);
      console.log("City ID:", route.params.cityId);
      console.log("Package Name:", route.params.packageName);
      console.log("Package ID:", route.params.packageId);
      console.log("Category Name:", route.params.categoryName);
      console.log("Category ID:", route.params.categoryId);
      console.log("Selected Pickup Point:", route.params.selectedPickupPoint);
      console.log("Price:", route.params.price);
      console.log("Selected Vehicle Type:", route.params.vehicleType);
      console.log("Selected Date:", selectedDate);
      console.log("Received Pickup Point ID:", route.params.selectedPickupPointId);



      // Pass the selected date and all other parameters to the "SelectSeatsj" page
      navigation.navigate("SelectSeats", {
        cityName: route.params.cityName,
        cityId: route.params.cityId,
        packageName: route.params.packageName,
        packageId: route.params.packageId,
        categoryName: route.params.categoryName,
        categoryId: route.params.categoryId,
        selectedPickupPoint: route.params.selectedPickupPoint,
        price: route.params.price,
        vehicleType: route.params.vehicleType,
        selectedDate: selectedDate, // Pass selected date here
        selectedPickupPointId:route.params.selectedPickupPointId,
      });
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
      <View style={styles.header}>
       <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonContainer}>
                       <View style={styles.backButtonCircle}>
                           <Text style={styles.backButton}>{'<'}</Text>
                       </View>
                   </TouchableOpacity>

        <Text style={styles.headerText}>Select Dates</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF5722" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={dates}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}

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
    backgroundColor: "#FFFFFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 5,
    marginLeft: -100,
  },
  backButton: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  listContainer: {
    marginTop: 20,
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
    width: "80%",
    alignItems: "center",
    marginLeft: 40,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SelectDateScreen;
