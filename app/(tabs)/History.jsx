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
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserAndHistory();
  }, []);




  useEffect(() => {
    // Handler for the back button press to reset the stack
    const backAction = () => {
      navigation.reset({
        index: 0, // Set the index to 0 to go to the first screen
        routes: [{ name: 'Dashboard' }], // Replace the entire stack with the Dashboard screen
      });
      return true; // Prevent default back button behavior
    };

    // Add event listener for back button
    BackHandler.addEventListener('hardwareBackPress', backAction);

    // Clean up the event listener on unmount
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, [navigation]);

  const fetchUserAndHistory = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      if (parsedUser && parsedUser.userName) {
        setUserName(parsedUser.userName);
      } else {
        Alert.alert("Error", "User data not found. Please log in again.");
        return;
      }

      const response = await fetch("http://ashtavinayak.somee.com/api/History");
      const jsonData = await response.json();

      if (jsonData.data) {
        setHistoryData(jsonData.data);

        // Filter history only for the logged-in user
        const userHistory = jsonData.data.filter(
          (item) => item.userName === parsedUser.userName
        );

        setFilteredHistory(userHistory);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Tour: {item.tourName}</Text>
      <Text style={styles.info}>City: {item.cityName}</Text>
      <Text style={styles.info}>Category: {item.categoryName}</Text>
      <Text style={styles.info}>Package: {item.packageName}</Text>
      <Text style={styles.info}>Drop Point: {item.dropPoint}</Text>
      <Text style={styles.price}>Total: ₹{item.total}</Text>
      <Text style={styles.advance}>Advance: ₹{item.advance}</Text>
      <Text style={styles.status(item.status)}>{item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Booking History</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#ff6600" />
      ) : filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.historyId.toString()}
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
    marginTop:20,
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
