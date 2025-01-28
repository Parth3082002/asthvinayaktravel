import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";

const SelectSeats = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const seats = [
    ["available", "booked", "ladies", "available", "booked", "ladies"],
    ["selected", "available", "booked", "ladies", "selected", "available"],
    ["available", "ladies", "available", "booked", "selected", "ladies"],
    ["booked", "selected", "available", "ladies", "booked", "selected"],
    ["available", "selected", "booked", "available", "selected", "available"],
  ];

  // Add a new seat to the first row at the first column
  seats[0].unshift("available"); // Adds a seat at the top-left section column

  const toggleSeat = (rowIndex, colIndex) => {
    const seatKey = `${rowIndex}-${colIndex}`;
    if (selectedSeats.includes(seatKey)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatKey));
    } else {
      setSelectedSeats([...selectedSeats, seatKey]);
    }
  };

  const renderSeat = (seatType, rowIndex, colIndex) => {
    const isSelected = selectedSeats.includes(`${rowIndex}-${colIndex}`);
    let seatStyle = styles.availableSeat;

    if (isSelected) {
      seatStyle = styles.selectedSeat;
    } else if (seatType === "booked") {
      seatStyle = styles.bookedSeat;
    } else if (seatType === "ladies") {
      seatStyle = styles.ladiesSeat;
    }

    return (
      <TouchableOpacity
        key={`${rowIndex}-${colIndex}`}
        style={[styles.seat, seatStyle]}
        disabled={seatType === "booked"}
        onPress={() => toggleSeat(rowIndex, colIndex)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.backArrow}>&lt;</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Seats</Text>
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.availableSeat]} />
          <Text>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.selectedSeat]} />
          <Text>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.bookedSeat]} />
          <Text>Booked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.ladiesSeat]} />
          <Text>Ladies</Text>
        </View>
      </View>
      <FlatList
        data={seats}
        renderItem={({ item, index: rowIndex }) => (
          <View style={styles.row}>
            {/* Left Section */}
            <View style={styles.leftSection}>
              {item.slice(0, 2).map((seatType, colIndex) => // Updated to slice up to the third seat
                renderSeat(seatType, rowIndex, colIndex)
              )}
            </View>

            {/* Space Between */}
            <View style={styles.spaceBetween} />

            {/* Right Section */}
            <View style={styles.rightSection}>
              {item.slice(0,2).map((seatType, colIndex) =>
                renderSeat(seatType, rowIndex, colIndex + 3)
              )}
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.seatMap}
      />
      <Image
  source={{
    uri: "https://img.icons8.com/color/48/000000/steering-wheel.png",
  }}
  style={styles.driverIcon}
/>

{/* Add a seat near the steering wheel */}
<TouchableOpacity
  style={styles.driverSeat}
  onPress={() => toggleSeat("driver", 0)} // Add custom handler for the driver's seat
>
  <View style={[styles.seat, styles.availableSeat]} />
</TouchableOpacity>

<TouchableOpacity style={styles.bookNowButton}>
        <Text style={styles.bookNowText}>Book Now</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
  },
  backArrow: {
    fontSize: 20,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 95,
    paddingHorizontal: 26,
  },
  legendItem: {
    alignItems: "center",
  },
  legendBox: {
    width: 30,
    height: 30,
    borderRadius: 4,
    marginBottom: 20,
  },
  seatMap: {
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    marginBottom: 30,
   
    justifyContent: "space-between",
    alignItems: "flex-start", // Aligns items to the top of the row
  },
  leftSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flex: 1,
    
  },
  rightSection: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flex: 1,
  },
  
  spaceBetween: {
    width: 80, // Adjust width as per the space requirement
  },
  seat: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  availableSeat: {
    backgroundColor: "#ff867c",
  },
  selectedSeat: {
    backgroundColor: "#e0e0e0",
  },
  bookedSeat: {
    backgroundColor: "#9e9e9e",
  },
  ladiesSeat: {
    backgroundColor: "#ffcdd2",
  },
  bookNowButton: {
    backgroundColor: "#ff5722",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 2,
    marginTop: 16,
  },
  bookNowText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  driverIcon: {
    width: 80,
    height: 80,
    position: "absolute",
    right: "9%",
    top: 140,
  },
  driverSeat: {
    position: "absolute",
    top: 160, // Adjust to position near the steering wheel
    left: "7%", // Adjust horizontal position near the steering wheel
  },
  
});

export default SelectSeats;
