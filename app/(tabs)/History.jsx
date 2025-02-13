import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  BackHandler
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';

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
        routes: [{ name: 'SelectVehicle1' }],
      });
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, [navigation]);

  const fetchUserAndHistory = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      if (parsedUser && parsedUser.userId) {
        const userId = parsedUser.userId;
        const response = await fetch(`http://ashtavinayak.somee.com/api/Booking/HistoryByUser/${userId}`);
        const jsonData = await response.json();

        if (jsonData.data && Array.isArray(jsonData.data)) {
          setHistoryData(jsonData.data);
        } else {
          setHistoryData([]);
          Alert.alert("No Data", "No booking history found for this user.");
        }
      } else {
        Alert.alert("Error", "User data not found. Please log in again.");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      Alert.alert("Error", "Failed to fetch booking history.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Tour: {item.tourName || "N/A"}</Text>
      <Text style={styles.info}>City: {item.cityName || "N/A"}</Text>
      <Text style={styles.info}>Category: {item.categoryName || "N/A"}</Text>
      <Text style={styles.info}>Package: {item.packageName || "N/A"}</Text>
      <Text style={styles.info}>Drop Point: {item.dropPoint || "N/A"}</Text>
      <Text style={styles.price}>Total: ₹{item.total || "0"}</Text>
      <Text style={styles.advance}>Advance: ₹{item.advance || "0"}</Text>
      <Text style={styles.status(item.status)}>{item.status || "Unknown"}</Text>
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
          keyExtractor={(item, index) => (item.historyId ? item.historyId.toString() : index.toString())}
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
    textAlign: "right",
  }),
  noHistoryText: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 20,
  },
});

export default History;
