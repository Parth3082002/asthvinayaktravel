import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  BackHandler,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("bus");
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserAndHistory("bus");
  }, [userId]);

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          setUserId(userObj.userId);
        } else {
          // Alert.alert("Error", "No user data found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error retrieving data:", error);
      }
    };

    fetchUserData();
  }, []);

  const fetchUserAndHistory = async (type) => {
    if (!userId) {
      // Alert.alert("Error", "User not found. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      console.log(`Fetching ${type} history for userId:`, userId);

      let apiUrl =
        type === "bus"
          ? `http://ashtavinayak.somee.com/api/Booking/HistoryByUser/${userId}`
          : `http://ashtavinayak.somee.com/api/Booking/FamilyBookingHistory/${userId}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch booking history. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Fetched ${type} history data:`, data);

      if (data.data && Array.isArray(data.data)) {
        setHistoryData(data.data);
      } else {
        setHistoryData([]);
      }
    } catch (error) {
      // console.error("Error fetching history:", error);
      // Alert.alert("Error", "Failed to fetch booking history.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    if (selectedType === "bus") {
      return (
        <View style={styles.card}>
          <Text style={styles.title}>Trip: {item.tripName || "N/A"}</Text>
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
    } else {
      return (
        <View style={styles.card}>
          <Text style={styles.title}>Car Type: {item.carType || "N/A"}</Text>
          <Text style={styles.info}>Pickup Point: {item.pickupPoint?.pickupPoint1 || "N/A"}</Text>

      <Text style={styles.info}>Drop Point: {item.droppoint || "N/A"}</Text>
      <Text style={styles.info}>Booking Date: {item.bookingDate || "N/A"}</Text>
     
      <Text style={styles.status(item.status)}>Status: {item.status || "Unknown"}</Text>
      <Text style={styles.price}>Total Payment: ₹{item.totalPayment || "0"}</Text>
      <Text style={styles.advance}>Advance: ₹{item.advance || "0"}</Text>
        </View>
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>My Booking History</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, selectedType === "bus" && styles.activeButton]}
          onPress={() => {
            setSelectedType("bus");
            fetchUserAndHistory("bus");
          }}
        >
          <Text style={styles.buttonText}>Bus Booking History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, selectedType === "car" && styles.activeButton]}
          onPress={() => {
            setSelectedType("car");
            fetchUserAndHistory("car");
          }}
        >
          <Text style={styles.buttonText}>Car Booking History</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
  <ActivityIndicator size="large" color="#ff6600" />
) : historyData.length > 0 ? (
  historyData.map((item, index) => (
    <View key={item.bookingId ? item.bookingId.toString() : index.toString()}>
      {renderItem({ item })}
    </View>
  ))
) : (
  <Text style={styles.noHistoryText}>No booking history found.</Text>
)}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f8f8",
    marginTop: 20,
    
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 6,
    backgroundColor: "#ccc",
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#ff6600",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  info: {
    fontSize: 14,
    color: "#555",
  },
  status: (status) => ({
    fontSize: 14,
    fontWeight: "bold",
    color: status === "Confirmed" ? "green" : "red",
  }),
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  advance: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ff6600",
  },
  noHistoryText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
    color: "#555",
  },
});

export default History;
