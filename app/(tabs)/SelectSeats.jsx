import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  BackHandler,
} from "react-native";
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

const SelectSeats = () => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();

  const {
    categoryId,
    tripId,
    totalBusSeats,
    selectedDate,
    ...restParams
  } = route.params || {};

  useEffect(() => {
    if (categoryId && tripId) {
      fetchSeatData();
    }
  }, [categoryId, tripId]);

  useFocusEffect(
    useCallback(() => {
      setSelectedSeats([]);
      fetchSeatData();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        navigation.navigate("SelectDate", {
          cityName: restParams.cityName,
          cityId: restParams.cityId,
          packageName: restParams.packageName,
          packageId: restParams.packageId,
          categoryName: restParams.categoryName,
          categoryId: restParams.categoryId,
          selectedPickupPoint: restParams.selectedPickupPoint,
          selectedPickupPointId: restParams.selectedPickupPointId,
          price: restParams.price,
          vehicleType: restParams.vehicleType,
          selectedVehicleId: restParams.selectedVehicleId,
          selectedBus: restParams.selectedBus,
          childWithSeatP: restParams.childWithSeatP,
          childWithoutSeatP: restParams.childWithoutSeatP,
          destinationId: restParams.destinationId,
          destinationName: restParams.destinationName,
          tuljapur: restParams.tuljapur,
          userName: restParams.userName,
        });
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [navigation])
  );

  const fetchSeatData = async () => {
    try {
      const bookedSeatsResponse = await fetch(
        `https://newenglishschool-001-site1.ktempurl.com/api/BookingSeat/ByTrip/${tripId}`
      );

      let bookedSeats = [];
      if (bookedSeatsResponse.ok) {
        const bookedSeatsData = await bookedSeatsResponse.json();
        bookedSeats = bookedSeatsData.data || [];
      }

      const totalSeats = totalBusSeats;
      let layout = [];
      
      if (totalSeats === 32) {
        layout = generateLayout32(bookedSeats);
      } else if (totalSeats === 17) {
        layout = generateLayout17(bookedSeats);
      } else {
        layout = generateLayout45(bookedSeats);
      }

      setSeats(layout);
    } catch (error) {
      console.error("Seat fetch error:", error);
    }
  };

  const generateLayout45 = (bookedSeats) => {
    const rows = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16],
      [17, 18, 19, 20],
      [21, 22, 23, 24],
      [25, 26, 27, 28],
      [29, 30, 31, 32],
      [33, 34, 35, 36],
      [37, 38, 39, 40],
      [41, 42, 43, 44, 45],
    ];

    return rows.map((row) =>
      row.map((num) =>
        num === null
          ? null
          : {
              seatNumber: `S${num}`,
              status: bookedSeats.includes(`S${num}`)
                ? "booked"
                : "available",
            }
      )
    );
  };

  const generateLayout32 = (bookedSeats) => {
    const rows = [
      [null, null, 1, 2],
      [6, 5, 4, 3],
      [7, 8, 9, 10],
      [14, 13, 12, 11],
      [15, 16, 17, 18],
      [22, 21, 20, 19],
      [23, 24, 25, 26],
      [31, 30, 29, 28, 27],
    ];

    return rows.map((row) =>
      row.map((num) =>
        num === null
          ? null
          : {
              seatNumber: `S${num}`,
              status: bookedSeats.includes(`S${num}`)
                ? "booked"
                : "available",
            }
      )
    );
  };

  const generateLayout17 = (bookedSeats) => {
    const rows = [
      [17, null, null, null],
      [1, null, 2, 3],
      [4, null, 5, 6],
      [7, null, 8, 9],
      [10, null, 11, 12],
      [13, 14, 15, 16],
    ];

    return rows.map((row) =>
      row.map((num) =>
        num === null
          ? null
          : {
              seatNumber: `S${num}`,
              status: bookedSeats.includes(`S${num}`)
                ? "booked"
                : "available",
            }
      )
    );
  };

  const toggleSeat = (seatKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // ✅ Expo compatible haptics
    if (selectedSeats.includes(seatKey)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatKey));
    } else {
      setSelectedSeats([...selectedSeats, seatKey]);
    }
  };
  

  const handleNextPress = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    navigation.navigate("Book", {
      ...restParams,
      selectedSeats,
      selectedDate,
      tripId,
    });
  };

  const renderFlatSeat = ({ item }) => {
    const isSelected = selectedSeats.includes(item.seatNumber);
    const isBooked = item.status === "booked";
    const seatStyle = isBooked
      ? styles.bookedSeat
      : isSelected
        ? styles.selectedSeat
        : styles.availableSeat;

    return (
      <TouchableOpacity
        style={[styles.seatBox, seatStyle]}
        disabled={isBooked}
        onPress={() => toggleSeat(item.seatNumber)}
      >
        <Text style={styles.seatText}>{item.seatNumber.replace("S", "")}</Text>
      </TouchableOpacity>
    );
  };

  const renderMatrixSeats = () => {
    return seats.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map((seat, colIndex) => {
          if (seat === null) {
            const emptyStyle =
              seats.length === 6 ? styles.emptySeat1 : styles.emptySeat;
            return <View key={colIndex} style={emptyStyle} />;
          }

          const isSelected = selectedSeats.includes(seat.seatNumber);
          const isBooked = seat.status === "booked";
          const seatStyle = isBooked
            ? styles.bookedSeat
            : isSelected
            ? styles.selectedSeat
            : styles.availableSeat;

          const seatContent = (
            <TouchableOpacity
              key={colIndex}
              style={[styles.seatBox, seatStyle]}
              disabled={isBooked}
              onPress={() => toggleSeat(seat.seatNumber)}
            >
              <Text style={styles.seatText}>
                {seat.seatNumber.replace("S", "")}
              </Text>
            </TouchableOpacity>
          );

          if (seats.length === 6 && row.length === 4 && colIndex === 1 && rowIndex < 5) {
            return (
              <React.Fragment key={colIndex}>
                <View style={{ width: 30 }} />
                {seatContent}
              </React.Fragment>
            );
          }

          if (seats.length === 8 && row.length === 4 && colIndex === 1) {
            return (
              <TouchableOpacity
                key={colIndex}
                style={[styles.seatBox, seatStyle, { marginRight: 55 }]}
                disabled={isBooked}
                onPress={() => toggleSeat(seat.seatNumber)}
              >
                <Text style={styles.seatText}>
                  {seat.seatNumber.replace("S", "")}
                </Text>
              </TouchableOpacity>
            );
          }
           // 45-seat layout (11 rows)
           if (seats.length === 11 && row.length >= 4) {
            const insertAisle = colIndex === 1 && row.length === 4;
            return (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.seatBox,
                  seatStyle,
                  insertAisle ? { marginRight: 50 } : {},
                  seats.length === 11 && (row.length === 4 || row.length === 5)
                    ? styles.smallSeat
                    : {},
                ]}
                disabled={isBooked}
                onPress={() => toggleSeat(seat.seatNumber)}
              >
                <Text style={styles.seatText}>
                  {seat.seatNumber.replace("S", "")}
                </Text>
              </TouchableOpacity>
            );
          }
          return seatContent;
        })}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Seats for {selectedDate}</Text>

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

      {Array.isArray(seats[0]) ? (
        <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 80 }}>
          {renderMatrixSeats()}
        </ScrollView>
      ) : (
        <FlatList
          data={seats}
          renderItem={renderFlatSeat}
          keyExtractor={(item, index) => index.toString()}
          numColumns={4}
          contentContainerStyle={{ alignItems: "center", paddingBottom: 80 }}
        />
      )}

      <TouchableOpacity
        style={[
          styles.nextButton,
          {
            backgroundColor: selectedSeats.length > 0 ? "#FF5722" : "#e0e0e0",
          },
        ]}
        onPress={handleNextPress}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, marginTop: 45, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  legendContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 30 },
  legendItem: { flexDirection: "row", alignItems: "center", marginHorizontal: 10 },
  legendColor: { width: 20, height: 20, borderRadius: 4, marginRight: 5 },
  seatBox: {
    width: 44, height: 44, margin: 5,
    borderRadius: 6, alignItems: "center", justifyContent: "center"
  },
  smallSeat: {
    width: 36,
    height: 36,
  },
  availableSeat: { backgroundColor: "#FF9800" },
  bookedSeat: { backgroundColor: "#B0BEC5" },
  selectedSeat: { backgroundColor: "#4CAF50" },
  seatText: { color: "#fff", fontWeight: "bold" },
  emptySeat: { width: 67, height: 44, margin: 5, backgroundColor: "transparent" },
  emptySeat1: { width: 44, height: 44, margin: 5, backgroundColor: "transparent" },
  row: { flexDirection: "row", justifyContent: "center" },
  nextButton: {
    position: "absolute", bottom: 50, left: 30, right: 30,
    borderRadius: 8, paddingVertical: 14, alignItems: "center",
  },
  nextButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default SelectSeats;