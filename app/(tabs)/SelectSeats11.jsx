import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const SelectSeats = () => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const navigation = useNavigation();
  const { params } = useRoute();
  const selectedDate = params?.selectedDate;
  const tripId = params?.tripId;
  const packageId = params?.packageId;

  useEffect(() => {
    if (packageId && tripId) {
      fetchSeatData();
    }
  }, [packageId, tripId]);

  const fetchSeatData = async () => {
    try {
      // Fetch trip details to get total seats
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

        // Fetch booked seats
        const bookedSeatsResponse = await fetch(
          `https://www.ashtavinayak.somee.com/api/BookingSeat/ByTrip/${tripId}`
        );

        let bookedSeats = [];
        if (bookedSeatsResponse.ok) {
          const bookedSeatsData = await bookedSeatsResponse.json();
          bookedSeats = bookedSeatsData.data || [];
        } else if (bookedSeatsResponse.status === 404) {
          // If no booked seats are found, initialize bookedSeats as an empty array
          bookedSeats = [];
        } else {
          throw new Error(`HTTP Error! Status: ${bookedSeatsResponse.status}`);
        }

        // Generate seat layout and mark booked seats
        const seatLayout = generateSeatsLayout(totalSeats, bookedSeats);
        setSeats(seatLayout);
      } else {
        console.warn("No matching trip found for the given tripId.");
      }
    } catch (error) {
      console.error("Error fetching seat data:", error);
    }
  };

  const generateSeatsLayout = (totalSeats, bookedSeats) => {
    let layout = [];

    for (let i = 0; i < totalSeats; i++) {
      const seatNumber = `S${i + 1}`;
      layout.push({
        seatNumber,
        status: bookedSeats.includes(seatNumber) ? "booked" : "available",
      });
    }

    return layout;
  };

  const toggleSeat = (index) => {
    const seat = seats[index];
    if (seat.status === "booked") return; // Prevent booked seat selection

    const seatKey = seat.seatNumber;
    if (selectedSeats.includes(seatKey)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatKey));
    } else {
      setSelectedSeats([...selectedSeats, seatKey]);
    }
  };

  const handleNextPress = () => {
    if (selectedSeats.length > 0) {
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
        numColumns={5}
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
    marginTop:20,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 8,
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

export default SelectSeats;

