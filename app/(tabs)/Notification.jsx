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
        routes: [{ name: 'SelectVehicle1' }],
      });
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, [navigation]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://ashtavinayak.somee.com/api/Notification/1");
      const jsonData = await response.json();

      if (jsonData.data) {
        setNotifications([jsonData.data]); // Ensure it's in an array format for FlatList
      } else {
        Alert.alert("Error", "No notifications found.");
      }
      

    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Trip: {item.tripId}</Text>
      <Text style={styles.info}>Vehicle: {item.vehicleName}</Text>
      <Text style={styles.message}>Message: {item.message}</Text>
      <Text style={styles.date}>Date: {new Date(item.date).toDateString()}</Text>
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
  info: {
    fontSize: 14,
    color: "#666",
    marginVertical: 2,
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