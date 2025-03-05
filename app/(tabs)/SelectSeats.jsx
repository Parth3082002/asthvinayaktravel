import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';
const SelectSeats = () => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const navigation = useNavigation();
  const { params } = useRoute();
  const route = useRoute();

  
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
    
    tripId,
    tourName,
    selectedDate, // if required
  } = route.params || {};

  useEffect(() => {
    if (packageId && tripId) {
      fetchSeatData();
    }
  }, [packageId, tripId]);

  useFocusEffect(
    useCallback(() => {
      // Reset selected seats when the screen is focused again
      setSelectedSeats([]);
      fetchSeatData(); // Refresh seat data
    }, [])
  );

  const fetchSeatData = async () => {
    try {
      const tripResponse = await fetch(
        `http://ashtavinayak.somee.com/api/Trip/TripsByPackage/${packageId}`
      );

      if (!tripResponse.ok) {
        throw new Error(`HTTP Error! Status: ${tripResponse.status}`);
      }

      const tripData = await tripResponse.json();
      const trip = tripData.data.find((t) => t.tripId === tripId);

      if (trip) {
        const totalSeats = trip.totalSeats;

        const bookedSeatsResponse = await fetch(
          `https://www.ashtavinayak.somee.com/api/BookingSeat/ByTrip/${tripId}`
        );

        let bookedSeats = [];
        if (bookedSeatsResponse.ok) {
          const bookedSeatsData = await bookedSeatsResponse.json();
          bookedSeats = bookedSeatsData.data || [];
        } else if (bookedSeatsResponse.status === 404) {
          bookedSeats = [];
        } else {
          throw new Error(`HTTP Error! Status: ${bookedSeatsResponse.status}`);
        }

        const seatLayout = generateSeatsLayout(totalSeats, bookedSeats);
        setSeats(seatLayout);
      } else {
        console.warn("No matching trip found for the given tripId.");
      }
    } catch (error) {
      console.error("Error fetching seat data:", error);
    }
  };



  // Generating the layout with 5 seats in the last row
const generateSeatsLayout = (totalSeats, bookedSeats) => {
  let layout = [];
  let seatCount = 1;

  // First 10 rows with 4 seats each
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 4; j++) {
      const seatNumber = `S${seatCount++}`;
      layout.push({
        seatNumber,
        status: bookedSeats.includes(seatNumber) ? "booked" : "available",
      });
    }
  }

  // Last row with 5 seats
  for (let i = 0; i < 5; i++) {
    const seatNumber = `S${seatCount++}`;
    layout.push({
      seatNumber,
      status: bookedSeats.includes(seatNumber) ? "booked" : "available",
    });
  }

  return layout;
};

  
  
  
  const toggleSeat = (index) => {
    const seat = seats[index];
    if (seat.status === "booked") return;

    const seatKey = seat.seatNumber;
    if (selectedSeats.includes(seatKey)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatKey));
    } else {
      setSelectedSeats([...selectedSeats, seatKey]);
    }
  };

  const handleNextPress = () => {
    if (selectedSeats.length > 0) {
      // Print each parameter separately
      // console.log("City Name:", cityName);
      // console.log("City ID:", cityId);
      // console.log("Package Name:", packageName);
      // console.log("Package ID:", packageId);
      // console.log("Category Name:", categoryName);
      // console.log("Category ID:", categoryId);
      // console.log("Selected Pickup Point:", selectedPickupPoint);
      // console.log("Selected Pickup Point ID:", selectedPickupPointId);
      // console.log("Price:", price);
      // console.log("Vehicle Type:", vehicleType);
      // console.log("Child With Seat Price:", childWithSeatP);
      // console.log("Child Without Seat Price:", childWithoutSeatP);
      // console.log("Trip Date:", selectedDate);
      // console.log("Trip ID:", tripId);
      // console.log("Tour Name:", tourName);
      // console.log("Selected Seats:", selectedSeats);
  
      // Navigate to the Book page with all params
      navigation.navigate("Book", {
        ...route.params,
        selectedSeats: selectedSeats,
        tripId: tripId,
      });
    } else {
      alert("Please select at least one seat");
    }
  };
  

  const renderSeat = ({ item, index }) => {
    const isSelected = selectedSeats.includes(item.seatNumber);
    let seatStyle = styles.availableSeat;
  
    if (isSelected) {
      seatStyle = styles.selectedSeat;
    } else if (item.status === "booked") {
      seatStyle = styles.bookedSeat;
    }
  
    const isLastRow = index >= 44; // Last 5 seats (41-45) start from index 40
  
    // Apply different styles for the last row
    const marginStyle = isLastRow
      ? styles.lastRowSeat // Apply the reduced size and specific margin style for the last row
      : index % 4 === 0 || index % 4 === 1
      ? { marginRight: 25 } // First 2 seats in a row
      : index % 4 === 2 || index % 4 === 3
      ? { marginLeft: 30 } // Last 2 seats in a row
      : {};
    
  
  
  return (
      <TouchableOpacity
      key={index}
      style={[styles.seat, seatStyle, marginStyle]}
      disabled={item.status === "booked"}
      onPress={() => toggleSeat(index)}
      >
      <Text style={styles.seatText}>{item.seatNumber}</Text>
      </TouchableOpacity>
      );
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Seats for Date: {selectedDate}</Text>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.availableSeat]} />
          <Text>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.bookedSeat]} />
          <Text>Booked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.selectedSeat]} />
          <Text>Selected</Text>
        </View>
      </View>
     
       <FlatList
        data={seats}
        renderItem={renderSeat}
        keyExtractor={(item, index) => index.toString()}
        numColumns={4} // Rendering 4 columns for most rows
        contentContainerStyle={styles.seatMap}
       />
      <TouchableOpacity
        style={[
          styles.nextButton,
          { backgroundColor: selectedSeats.length > 0 ? "#FF5722" : "#e0e0e0" },
        ]}
        onPress={handleNextPress}
        disabled={selectedSeats.length === 0}
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 20,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 5,
    marginRight: 5,
  },
  seatMap: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  lastRowSeat: {
    height: 40, // Reduced size for last row
    width: 45,
    // marginHorizontal: -20, // Spacing between the 5 seats
    // marginLeft:0,
    marginRight:10,
    marginVertical:-45,
  },
  seat: {
    height: 40,
    width: 50,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
  
  },
  availableSeat: {
    backgroundColor: "#FF5722",
  },
  bookedSeat: {
    backgroundColor: "#B0BEC5",
  },
  selectedSeat: {
    backgroundColor: "#4CAF50",
  },
  seatText: {
    color: "#fff",
    fontWeight: "bold",
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default SelectSeats;
