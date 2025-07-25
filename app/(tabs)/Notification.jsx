import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, BackHandler, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';

const NotificationsScreen = () => {
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          setUserId(userObj.userId);
        }
      } catch (error) {
        console.error("Error retrieving user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`https://ashtavinayak.itastourism.com/api/Notification/GetUserNotifications/${userId}`);
        const data = await response.json();

        if (response.ok) {
          setNotifications(data.notifications);
        } else {
          // console.error("Error fetching notifications:", data.message);
        }
      } catch (error) {
        // console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: "SelectVehicle1" }],
          })}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.heading}>Notifications</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : notifications.length === 0 ? (
        <Text style={styles.noDataText}>No notifications available.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.notificationId.toString()}
          renderItem={({ item }) => (
            <View style={styles.notificationCard}>
              <Text style={styles.notificationMessage}>{item.notificationMessage}</Text>
              <Text style={styles.dateText}>Date: {new Date(item.notificationDate).toLocaleString()}</Text>
              <Text style={styles.sectionTitle}>Vehicle Details:</Text>
              <Text>Vehicle Name: {item.vehicle.vehicleName}</Text>
              <Text>Vehicle Number: {item.vehicle.vehicleNumber}</Text>
              <Text>Vehicle Type: {item.vehicle.vehicleType}</Text>
              <Text>Driver Name: {item.vehicle.driverName}</Text>
              <Text>Driver Contact: {item.vehicle.driverContact}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    marginTop: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  notificationCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationMessage: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 14,
    color: "gray",
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 8,
    color:'#FF5722',
  },
  noDataText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "gray",
  },
});

export default NotificationsScreen;
