import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const SelectSeats = () => {
  const { params } = useRoute();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [tripId, setTripId] = useState(null);
  const navigation = useNavigation();
  const selectedDate = params?.selectedDate;

  useEffect(() => {
    fetchSeatData();
  }, [selectedDate]);

  const fetchSeatData = async () => {
    try {
      const response = await fetch(
        `http://ashtavinayak.somee.com/api/Trip/TripsByDate/${selectedDate}`
      );
      const result = await response.json();
  
      if (!result || !result.data || result.data.length === 0) {
        console.error("No trip data found for the selected date.");
        return;
      }
  
      const trip = result.data[0]; // Assuming first trip is relevant
      setTripId(trip.tripId);
      
      console.log("Fetched tripId:", trip.tripId);
  
      let seatsLayout = generateSeatsLayout(trip.totalSeats, trip.availableSeats);
      setSeats(seatsLayout);
    } catch (error) {
      console.error("Error fetching seat data:", error);
    }
  };
  
  const generateSeatsLayout = (totalSeats, availableSeats) => {
    let layout = [];
    let availableSeatsSet = new Set();
  
    while (availableSeatsSet.size < availableSeats) {
      let randomSeat = Math.floor(Math.random() * totalSeats);
      availableSeatsSet.add(randomSeat);
    }
  
    for (let i = 0; i < totalSeats; i++) {
      layout.push({
        seatNumber: `S${i + 1}`,
        status: availableSeatsSet.has(i) ? "available" : "booked"
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
      console.log("Navigating with the following data:", selectedSeats);
      navigation.navigate("Book", {
        ...params,
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
    
    return (
      <TouchableOpacity
        key={index}
        style={[styles.seat, seatStyle]}
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
        numColumns={5}  // Set 5 columns for seat layout
        contentContainerStyle={styles.seatMap}
      />

      <TouchableOpacity
        style={[styles.nextButton, { backgroundColor: selectedSeats.length > 0 ? "#FF5722" : "#e0e0e0" }]}
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
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
    justifyContent: "center",
    alignItems: "center",
  },
  seat: {
    width: 50,  // Increased seat width
    height: 50, // Increased seat height
    borderRadius: 25, // Adjusted for circular shape
    margin: 8, // Increased spacing for better visibility
    justifyContent: "center",
    alignItems: "center",
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

export default SelectSeats;
