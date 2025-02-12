import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  BackHandler
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isProfileVisible, setProfileVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const backAction = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'index' }],
      });
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); // Clears all stored data
      setUser(null);
      setProfileVisible(false);
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  

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

  useEffect(() => {
    fetchUserData();
  }, []);

  const handlePress = (screen) => {
    if (screen) {
      navigation.navigate(screen);
    }
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome{" "}
          <Text style={styles.subText}>
            to{"\n"}Ashtavinayak Yatra{"\n"}
            {user?.userName}
          </Text>
        </Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => handlePress("History")}>
            <Icon name="history" size={30} color="black" style={styles.icon} />
          </TouchableOpacity>
          <Icon name="notifications" size={30} color="black" style={styles.icon} />
          <TouchableOpacity onPress={() => setProfileVisible(true)}>
            <Icon name="account-circle" size={40} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cardsContainer}>
          {[
            { name: "Mayureshwar", screen: "Bappa1", image: require("../../assets/images/mayureshwar.png") },
            { name: "Siddhivinayak", screen: "Bappa2", image: require("../../assets/images/siddhivinayak.png") },
            { name: "Ballaleshwar", screen: "Bappa3", image: require("../../assets/images/ballaleshwar1.png") },
            { name: "VaradaVinayak", screen: "Bappa4", image: require("../../assets/images/vardavinayak.png") },
            { name: "Chintamani", screen: "Bappa5", image: require("../../assets/images/chintamani.png") },
            { name: "Girijatmaj", screen: "Bappa6", image: require("../../assets/images/girjamaj.png") },
            { name: "Vighneshwar", screen: "Bappa7", image: require("../../assets/images/vigneshwar.png") },
            { name: "Mahaganpati", screen: "Bappa8", image: require("../../assets/images/mahaganpati.png") },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={styles.card} onPress={() => handlePress(item.screen)}>
            <Image source={item.image} style={styles.ganpatiImage} />
            <View style={styles.overlay}>
              <Text style={styles.ganpatiName}>{item.name}</Text>
            </View>
          </TouchableOpacity>
          
          ))}
        </View>
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookingButton} onPress={() => handlePress("SelectVehicle1")}>
          <Text style={styles.bookingText}>Start Booking</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Modal */}
      {isProfileVisible && user && (
        <View style={styles.profileModal}>
          <View style={styles.profileContent}>
            <Text style={styles.profileText}>User Profile</Text>
            <Text style={styles.userInfo}>Username: {user.userName}</Text>
            <Text style={styles.userInfo}>Email: {user.email}</Text>
            <Text style={styles.userInfo}>Phone No: {user.phoneNumber}</Text>
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },

  /* Header */
  header: {
    height: 100,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop:20
  },
  welcomeText: { fontSize: 18, fontWeight: "bold", color: "#ff6600" },
  subText: { fontSize: 16, color: "black", fontStyle: "italic" },
  
  /* Icons on Right Side */
  iconContainer: { flexDirection: "row", alignItems: "center" },
  icon: { marginLeft: 10 },

  /* Scrollable Cards */
  scrollContent: { paddingBottom: 80 },
  cardsContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 30, marginTop: 10 },
  card: { width: "42%", backgroundColor: "#fff", padding: 10, borderRadius: 10, marginBottom: 15, alignItems: "center", elevation: 3 },
  ganpatiImage: { width: 90, height: 90, borderRadius: 10 },
  ganpatiName: { marginTop: 6, fontSize: 14, fontWeight: "bold", textAlign: "center" },

  /* Fixed Footer */
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 15,
    alignItems: "center",
    elevation: 5,
  },
  bookingButton: { backgroundColor: "#ff6600", paddingVertical: 12, paddingHorizontal: 110, borderRadius: 10 },
  bookingText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  /* Profile Modal */
  profileModal: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  profileContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%", alignItems: "center" },
  profileText: { fontSize: 24, fontWeight: "bold", color: "#ff6600" },
  userInfo: { fontSize: 16, color: "#333", marginVertical: 2 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 10 },
  logoutButton: { backgroundColor: "#ff6600", paddingVertical: 10, paddingHorizontal: 30, borderRadius: 5 },
  closeButton: { backgroundColor: "#ff6600", paddingVertical: 10, paddingHorizontal: 30, borderRadius: 5 },
  buttonText: { fontSize: 18, color: "#fff", textAlign: "center" },
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black
    paddingVertical: 5,
    alignItems: "center",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  ganpatiName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  
});

export default Dashboard;
