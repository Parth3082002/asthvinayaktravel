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

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchNotifications();
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

  const fetchNotifications = async () => {
    try {
      const storedTrip = await AsyncStorage.getItem("tripId");
      const tripId = storedTrip ? JSON.parse(storedTrip) : null;

      if (!tripId) {
        Alert.alert("Error", "Trip ID not found.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://ashtavinayak.somee.com/api/Notification/GetNotificationsByTrip/${tripId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications. Status: ${response.status}`);
      }

      const jsonData = await response.json();

      if (jsonData.data && Array.isArray(jsonData.data)) {
        setNotifications(jsonData.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      Alert.alert("Error", "Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Trip: {item.tripName}</Text>
      <Text style={styles.message}>Message: {item.notificationMessage}</Text>
      <Text style={styles.date}>
        Date: {new Date(item.notificationDate).toDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#ff6600" />
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.notificationId.toString()}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.noNotificationText}>No notifications found.</Text>
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
  message: {
    fontSize: 14,
    color: "#666",
    marginVertical: 2,
  },
  date: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
    textAlign: "right",
  },
  noNotificationText: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 20,
  },
});

export default NotificationScreen;
