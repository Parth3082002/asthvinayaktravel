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
  // const navigation = useNavigation();


  
  useEffect(() => {
    // Handler for the back button press to reset the stack
    const backAction = () => {
      navigation.reset({
        index: 0, // Set the index to 0 to go to the first screen
        routes: [{ name: 'index' }], // Replace the entire stack with the Dashboard screen
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


  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user"); // Remove stored user data
      setUser(null); // Reset local state
      setProfileVisible(false); // Close modal
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      }); // Reset navigation stack
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  
  
  
  // Fetch user data from AsyncStorage dynamically
  const fetchUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        console.log("No user data found in AsyncStorage.");
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    console.log("Navigation Prop:", navigation); // Check if navigation is being passed
  }, [navigation]);

  // Handling press events with fallback checks
  const handlePress = (screen) => {
    if (screen) {
      navigation.navigate(screen);
    } else {
      console.warn("Navigation failed. Screen is undefined.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.firstContainer}>
        {user && (
          <Text style={styles.welcomeText}>
            Welcome{" "}
            <Text style={styles.subText}>
              to{"\n"}Ashtavinayak Yatra{"\n"}
              {user.userName}
            </Text>
          </Text>
        )}

        <View style={styles.iconContainer}>
          <Icon
            name="notifications"
            size={30}
            color="black"
            style={styles.notificationIcon}
          />
          <TouchableOpacity onPress={() => setProfileVisible(true)}>
            <Icon name="account-circle" size={40} color="black" />
          </TouchableOpacity>
        </View>



        <View style={styles.iconContainer}>
  <TouchableOpacity onPress={() => handlePress("History")}>
    <Icon name="history" size={30} color="black" style={styles.historyIcon} />
  </TouchableOpacity>

  <Icon
    name="notifications"
    size={30}
    color="black"
    style={styles.notificationIcon}
  />

  <TouchableOpacity onPress={() => setProfileVisible(true)}>
    <Icon name="account-circle" size={40} color="black" />
  </TouchableOpacity>
</View>


        <TouchableOpacity
          style={styles.bookingButton}
          onPress={() => handlePress("SelectVehicle")}
        >
          <Text style={styles.bookingText}>Start Booking</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 10 }} />

      <View style={styles.secondContainer}>
        <ScrollView contentContainerStyle={styles.ganpatiContainer}>
          {/* First Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => handlePress("Bappa1")}
          >
            <Image
              source={require("../../assets/images/Bappa.png")}
              style={styles.ganpatiImage}
            />
            <Text style={styles.ganpatiName}>Mayureshwar</Text>
          </TouchableOpacity>

          {/* Second Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => handlePress("Bappa2")}
          >
            <Image
              source={require("../../assets/images/Bappa.png")}
              style={styles.ganpatiImage}
            />
            <Text style={styles.ganpatiName}>Siddhivinayak</Text>
          </TouchableOpacity>

          {/* Third Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => handlePress("Bappa3")}
          >
            <Image
              source={require("../../assets/images/Bappa.png")}
              style={styles.ganpatiImage}
            />
            <Text style={styles.ganpatiName}>Ballaleshwar</Text>
          </TouchableOpacity>

          {/* Fourth Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => handlePress("Bappa4")}
          >
            <Image
              source={require("../../assets/images/Bappa.png")}
              style={styles.ganpatiImage}
            />
            <Text style={styles.ganpatiName}>VaradaVinayak</Text>
          </TouchableOpacity>

          {/* Fifth Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => handlePress("Bappa5")}
          >
            <Image
              source={require("../../assets/images/Bappa.png")}
              style={styles.ganpatiImage}
            />
            <Text style={styles.ganpatiName}>Chintamani</Text>
          </TouchableOpacity>

          {/* Sixth Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => handlePress("Bappa6")}
          >
            <Image
              source={require("../../assets/images/Bappa.png")}
              style={styles.ganpatiImage}
            />
            <Text style={styles.ganpatiName}>Girijatmaj</Text>
          </TouchableOpacity>

          {/* Seventh Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => handlePress("Bappa7")}
          >
            <Image
              source={require("../../assets/images/Bappa.png")}
              style={styles.ganpatiImage}
            />
            <Text style={styles.ganpatiName}>Vighneshwar</Text>
          </TouchableOpacity>

          {/* Eighth Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => handlePress("Bappa8")}
          >
            <Image
              source={require("../../assets/images/Bappa.png")}
              style={styles.ganpatiImage}
            />
            <Text style={styles.ganpatiName}>Mahaganpati</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

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
  firstContainer: {
    height: 210,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "space-between",
    elevation: 3,
    position: "relative",
  },

  historyIcon: { marginRight: 15 },

  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ff6600",
    textAlign: "left",
    position: "absolute",
    left: 20,
    top: 40,
    fontFamily: "Dancing Script",
  },
  subText: { fontSize: 20, color: "black", textAlign: "left", fontStyle: "italic", lineHeight: 30 },
  iconContainer: { flexDirection: "row", justifyContent: "flex-end", position: "absolute", right: 20, top: 40 },
  notificationIcon: { marginRight: 15 },
  bookingButton: { backgroundColor: "#ff6600", paddingVertical: 12, paddingHorizontal: 110, borderRadius: 10, marginTop: 120, alignSelf: "flex-start" },
  bookingText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  secondContainer: { flex: 1, backgroundColor: "#fff", paddingTop: 20, paddingHorizontal: 10, elevation: 3 },
  ganpatiContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 15 },
  card: { width: "48%", backgroundColor: "#fff", padding: 10, borderRadius: 10, marginBottom: 15, alignItems: "center", elevation: 3 },
  ganpatiImage: { width: 75, height: 75, borderRadius: 10 },
  ganpatiName: { marginTop: 6, fontSize: 14, fontWeight: "bold", textAlign: "center" },
  profileModal: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  profileContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%", alignItems: "center" },
  profileText: { fontSize: 24, fontWeight: "bold", color: "#ff6600", marginBottom: 0 },
  userInfo: { fontSize: 16, color: "#333", marginVertical: 2, textAlign: "center" },
  // closeButton: { backgroundColor: "#ff6600", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, marginTop: 10 },
  // closeButtonText: { fontSize: 18, color: "#fff", textAlign: "center" },

  buttonContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 10 },
  logoutButton: { backgroundColor: "#ff6600", paddingVertical: 10, paddingHorizontal: 30, borderRadius: 5 },
  closeButton: { backgroundColor: "#ff6600", paddingVertical: 10, paddingHorizontal: 30, borderRadius: 5 },
  buttonText: { fontSize: 18, color: "#fff", textAlign: "center" },
});

export default Dashboard;
