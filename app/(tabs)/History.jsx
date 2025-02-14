import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  BackHandler,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserAndHistory();
  }, []);

  useEffect(() => {
    const backAction = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: "SelectVehicle1" }],
      });
      return true;
    };

    BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", backAction);
    };
  }, [navigation]);

  const fetchUserAndHistory = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      if (!parsedUser || !parsedUser.userId) {
        Alert.alert("Error", "User data not found. Please log in again.");
        setLoading(false);
        return;
      }

      const userId = parsedUser.userId;
      console.log("Fetching history for userId:", userId);

      const historyResponse = await fetch(
        `http://ashtavinayak.somee.com/api/Booking/HistoryByUser/${userId}`
      );

      if (!historyResponse.ok) {
        throw new Error(
          `Failed to fetch booking history. Status: ${historyResponse.status}`
        );
      }

      const historyData = await historyResponse.json();
      console.log("Fetched history data:", historyData);

      if (historyData.data && Array.isArray(historyData.data)) {
        setHistoryData(historyData.data);
      } else {
        setHistoryData([]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      Alert.alert("Error", "Failed to fetch booking history.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.tourName || "N/A"}</Text>
      <Text style={styles.info}>Pickup Point: {item.pickupPointName || "N/A"}</Text>
      <Text style={styles.info}>Drop Point: {item.droppoint || "N/A"}</Text>
      <Text style={styles.info}>Booking Date: {item.bookingDate || "N/A"}</Text>
      <Text style={styles.status(item.status)}>Status: {item.status || "Unknown"}</Text>
      <Text style={styles.price}>Total Payment: ₹{item.totalPayment || "0"}</Text>
      <Text style={styles.advance}>Advance: ₹{item.advance || "0"}</Text>

      <Text style={styles.seatHeader}>Seat Numbers:</Text>
      {item.seatNumbers && item.seatNumbers.length > 0 ? (
        <Text style={styles.seatText}>
          {item.seatNumbers.map((seat) => `S${seat.seatNumber}`).join(", ")}
        </Text>
      ) : (
        <Text style={styles.info}>No Seat Information</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Booking History</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#ff6600" />
      ) : historyData.length > 0 ? (
        <FlatList
          data={historyData}
          keyExtractor={(item, index) =>
            item.historyId ? item.historyId.toString() : index.toString()
          }
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.noHistoryText}>No booking history found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 15,
    marginTop: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#ff6600",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  info: {
    fontSize: 14,
    color: "#666",
    marginVertical: 2,
  },
  seatHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff6600",
    marginTop: 10,
  },
  seatText: {
    fontSize: 14,
    color: "#333",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#27ae60",
    marginTop: 5,
  },
  advance: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2980b9",
    marginTop: 2,
  },
  status: (status) => ({
    fontSize: 14,
    fontWeight: "bold",
    color: status === "Confirmed" ? "green" : "red",
    marginTop: 5,
  }),
  noHistoryText: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 20,
  },
});

export default History;

