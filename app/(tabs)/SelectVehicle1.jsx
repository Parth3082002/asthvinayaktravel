import React, { useState, useEffect, useRef } from "react";

import { 
  View, Text, StyleSheet, TextInput, Animated, TouchableOpacity, 
  Image, FlatList, Modal,BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

// Import images
import BusImage from "@/assets/images/bus1.png";
import CarImage from "@/assets/images/Car.png";

const cars = [
  {
    id: "1",
    name: "Bus",
    type: "BUS",
    description: "A bus offers spacious seating and a comfortable ride for group travel.",
    image: BusImage,
  },
  {
    id: "2",
    name: "Car",
    type: "CAR",
    description: "A sedan offers comfort, fuel efficiency, and a smooth ride for travel.",
    image: CarImage,
  },
];

const Dashboard = () => {
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const [isProfileVisible, setProfileVisible] = useState(false);
  const moveAnim = useRef(new Animated.Value(0)).current;  // Animation to move the images around the center

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };
    fetchUserData();
  }, []);

  
    useEffect(() => {
          const backAction = () => {
              // Reset navigation stack and navigate back to Home
              navigation.reset({
                  index: 0,
                  routes: [{ name: 'index' }],
              });
              return true;  // Prevent default back action
          };
  
          // Add event listener for physical back button
          const backHandler = BackHandler.addEventListener(
              'hardwareBackPress',
              backAction
          );
  
          // Clean up the event listener on component unmount
          return () => backHandler.remove();
      }, [navigation]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      setUser(null);
      setProfileVisible(false);
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleVehicleSelect = async (vehicleType) => {
    try {
      await AsyncStorage.setItem("vehicleType", vehicleType);
      navigation.navigate("Home"); // Navigate to SelectVehicle screen
    } catch (error) {
      console.error("Error saving vehicle type:", error);
    }
  };

  const filteredCars = cars.filter((item) => {
    const matchesFilter = selectedFilter === "ALL" || item.type === selectedFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.userName}!</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("History")}>
            <Icon name="history" size={30} color="black" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Notification")}>

          <Icon name="notifications" size={30} color="black" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setProfileVisible(true)}>
            <Icon name="account-circle" size={40} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Modal */}
      <Modal visible={isProfileVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.profileModal}>
            <Text style={styles.profileText}>User Profile</Text>
            <Text style={styles.userInfo}>Username: {user?.userName}</Text>
            <Text style={styles.userInfo}>Email: {user?.email}</Text>
            <Text style={styles.userInfo}>Phone No: {user?.phoneNumber}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setProfileVisible(false)}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="gray" />
        <TextInput 
          placeholder="Search here" 
          style={styles.searchInput} 
          value={searchQuery} 
          onChangeText={setSearchQuery} 
        />
      </View>

      {/* Filter Tabs */}
      <View style={{ flexDirection: "row", marginTop: 20 }}>
        {["ALL", "CAR", "BUS"].map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={{
              marginRight: 15,
              borderBottomWidth: selectedFilter === filter ? 2 : 0,
              borderBottomColor: selectedFilter === filter ? "black" : "transparent",
            }}
          >
            <Text style={{ fontWeight: selectedFilter === filter ? "bold" : "normal" }}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Car List */}
      <FlatList
        data={filteredCars}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.name}</Text>
              <Text style={{ color: "gray", fontSize: 12 }}>{item.description}</Text>
              <TouchableOpacity 
                style={styles.bookNowButton} 
                onPress={() => handleVehicleSelect(item.type)}
              >
                <Text style={{ color: "white" }}>Book Now</Text>
              </TouchableOpacity>
            </View>
            <Image source={item.image} style={styles.carImage} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center",marginTop: 20, marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: "bold" },
  iconContainer: { flexDirection: "row", alignItems: "center" },
  icon: { marginLeft: 10 },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  profileModal: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%", alignItems: "center" },
  profileText: { fontSize: 24, fontWeight: "bold", color: "#ff6600" },
  userInfo: { fontSize: 16, color: "#333", marginVertical: 2 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 10 },
  logoutButton: { backgroundColor: "#ff6600", paddingVertical: 10, paddingHorizontal: 30, borderRadius: 5 },
  closeButton: { backgroundColor: "#ff6600", paddingVertical: 10, paddingHorizontal: 30, borderRadius: 5 },
  buttonText: { fontSize: 18, color: "#fff", textAlign: "center" },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#f0f0f0", borderRadius: 10, paddingHorizontal: 10, height: 40 },
  searchInput: { flex: 1, marginLeft: 10 },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, flexDirection: "row", alignItems: "center", marginTop: 15, elevation: 3 },
  carImage: { width: 150, height: 90, resizeMode: "contain" },
  bookNowButton: { backgroundColor: "#ff6600", paddingVertical: 5, paddingHorizontal: 15, borderRadius: 5, marginTop: 10, alignSelf: "flex-start" },
});

export default Dashboard;
