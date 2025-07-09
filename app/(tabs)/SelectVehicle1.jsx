import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Animated,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from '@react-navigation/native';

// Images
import BusImage from "@/assets/images/bus1.png";
import CarImage from "@/assets/images/Car.png";

const cars = [
  {
    id: "1",
    name: "Bus",
    type: "BUS",
    description: "Comfortable and spacious ride for group travel.",
    image: BusImage,
  },
  {
    id: "2",
    name: "Car",
    type: "CAR",
    description: "Fuel-efficient, stylish ride for personalized journeys.",
    image: CarImage,
  },
];

const Dashboard = () => {
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [isProfileVisible, setProfileVisible] = useState(false);
  const navigation = useNavigation();
  const moveAnim = useRef(new Animated.Value(0)).current;

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
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

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
      let selectedVehicleId = vehicleType === "BUS" ? 1 : 2;
      let selectedBus = vehicleType === "BUS";
      navigation.navigate("Home", {
        userName: user?.userName,
        selectedVehicleId,
        selectedBus,
      });
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
        <Text style={styles.greeting}>Hi, {user?.userName} 👋</Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("History")}>
            <Icon name="history" size={26} color="#333" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Notification")}>
            <Icon name="notifications" size={26} color="#333" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setProfileVisible(true)}>
            <Icon name="account-circle" size={36} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Modal */}
      <Modal visible={isProfileVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.profileModal}>
            <Text style={styles.profileText}>👤 User Profile</Text>
            <Text style={styles.userInfo}>Username: {user?.userName}</Text>
            <Text style={styles.userInfo}>Email: {user?.email}</Text>
            <Text style={styles.userInfo}>Phone: {user?.phoneNumber}</Text>
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

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#777" />
        <TextInput
          placeholder="Search transport type"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {["ALL", "CAR", "BUS"].map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={[
              styles.tab,
              selectedFilter === filter && styles.activeTab,
            ]}
          >
            <Text style={selectedFilter === filter ? styles.activeTabText : styles.tabText}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cards */}
      <FlatList
        data={filteredCars}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => handleVehicleSelect(item.type)}
          >
            <Image source={item.image} style={styles.cardImage} />
            <View style={styles.cardOverlay} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
              <TouchableOpacity style={styles.bookButton}
              onPress={() => handleVehicleSelect(item.type)}
              >
                <Text style={styles.bookButtonText}>Book Now</Text>
                <Ionicons name="arrow-forward" color="#fff" size={16} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f4f7", paddingHorizontal: 20, paddingTop: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: "bold", color: "#222" },
  iconContainer: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { marginHorizontal: 4 },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  profileModal: { backgroundColor: "#fff", padding: 25, borderRadius: 12, width: "85%", alignItems: "center" },
  profileText: { fontSize: 22, fontWeight: "bold", color: "#ff6600", marginBottom: 10 },
  userInfo: { fontSize: 15, color: "#444", marginVertical: 2 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: 20 },
  logoutButton: { backgroundColor: "#ff3b30", padding: 12, borderRadius: 8, width: "45%" },
  closeButton: { backgroundColor: "#aaa", padding: 12, borderRadius: 8, width: "45%" },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 15, height: 45, elevation: 2 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: "#333" },
  filterTabs: { flexDirection: "row", justifyContent: "space-around", marginVertical: 20 },
  tab: { paddingBottom: 6 },
  tabText: { fontSize: 16, color: "#777" },
  activeTab: { borderBottomWidth: 2, borderColor: "#ff6600" },
  activeTabText: { fontSize: 16, fontWeight: "bold", color: "#ff6600" },
  card: {
    height: 180,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    elevation: 4,
    backgroundColor: "#fff",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    resizeMode: "cover",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(48, 48, 48, 0.5)",
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  cardDesc: {
    fontSize: 14,
    color: "#eee",
    fontWeight: "bold",
    marginTop: 5,
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff6600",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 10,
  },
  bookButtonText: {
    color: "#fff",
    marginRight: 6,
    fontWeight: "bold",
  },
});

export default Dashboard;
