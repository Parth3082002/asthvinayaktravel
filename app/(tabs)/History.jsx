// Same imports, just ensure these are present
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  Easing,
  BackHandler,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, CommonActions, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import LottieView from "lottie-react-native";

const History = () => {
  const [busHistoryData, setBusHistoryData] = useState([]);
  const [carHistoryData, setCarHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState("bus");
  const [userId, setUserId] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
   // State for user data
   const [user, setUser] = useState(null);
   const [mobileNo, setMobileNo] = useState(null);
   const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedMobileNo = await AsyncStorage.getItem("mobileNo");
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedMobileNo && storedToken && storedUser) {
          setMobileNo(storedMobileNo);
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          Alert.alert("Error", "Login information not found. Please log in again.");
        }
      } catch (error) {
        console.error("Error retrieving user data:", error);
        Alert.alert("Error", "Failed to retrieve user information.");
      }
    };
    fetchUserData();
  }, []);


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

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const busRes = await fetch(
        `https://newenglishschool-001-site1.ktempurl.com/api/Booking/HistoryByUser/${userId}`
      );
      const carRes = await fetch(
        `https://newenglishschool-001-site1.ktempurl.com/api/Booking/FamilyBookingHistory/${userId}`
      );
      const busData = await busRes.json();
      const carData = await carRes.json();
      setBusHistoryData(busData?.data || []);
      setCarHistoryData(carData?.data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setBusHistoryData([]);
      setCarHistoryData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchHistory();
  }, [userId, fetchHistory]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [selectedType, busHistoryData, carHistoryData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB");
    } catch (error) {
      return "N/A";
    }
  };

  const toggleExpand = (index) => {
    setExpandedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handlePayRemaining = (item) => {
    
    navigation.navigate("PaymentScreen", {
      userId: user?.userId,
      userName: user?.userName,
      email: user?.email,
      phone: user?.phoneNumber,
      amount: item.pendingAmount || 0,
      remainingPayment: true,
      transactionId : item.transactions[0]?.transactionId,
      bookingId : item.bookingId,
      carPayment: false,
      razorpayKeyId: 'rzp_test_SqJODX06AyCHj3', // Add the Razorpay key
      token: token // Add the token for API calls
    });
  };

  const renderCard = (item, index) => {
    const isExpanded = expandedCards[index];
    const pendingAmount = parseFloat(item.pendingAmount || "0");

    return (
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <View style={styles.row}>
          <Icon name={selectedType === "bus" ? "bus" : "car"} size={20} color="#FF6B00" />
          <Text style={styles.title}>
            {selectedType === "bus" ? `Trip: ${item.tripName || "N/A"}` : `Car: ${item.carType || "N/A"}`}
          </Text>
          <Text style={styles.dateText}> | {selectedType === "bus" ? formatDate(item.bookingDate) : formatDate(item.date)}</Text>
        </View>


        <View style={styles.detailRow}>
          <Icon name="location" size={18} color="#555" />
          <Text style={styles.info}>{selectedType === "bus" ? `Pickup: ${item.pickupPointName || "N/A"}` : `Pickup: ${item.pickUpPointName || "N/A"}`}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="flag" size={18} color="#555" />
          <Text style={styles.info}>Drop: {item.droppoint || "N/A"}</Text>
        </View>

        {isExpanded && (
          <>
            <View style={styles.detailRow}>
              <Icon name="wallet" size={18} color="#555" />
              <Text style={styles.price}>Total: ₹{item.totalPayment || "0"}</Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="cash" size={18} color="#555" />
              <Text style={[styles.advance, { color: item.totalPayment == item.paidAmount ? "green" : "#FF6B00" }]}>
                Paid Amount: ₹{item.paidAmount || "0"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="cash" size={18} color="#555" />
              <Text style={[styles.advance, { color: pendingAmount === 0 ? "green" : "red" }]}>
                Pending Amount: ₹{item.pendingAmount || "0"}
              </Text>
            </View>

            <Text style={[styles.status, { color: item.status === "Confirmed" ? "green" : "red" }]}>
              Status: {item.status || "Pending"}
            </Text>

            {selectedType === "bus" && item.seatNumbers?.length > 0 && (
              <>
                <Text style={styles.seatHeader}>Seats:</Text>
                <Text style={styles.seatText}>
                  {item.seatNumbers.map((seat) => seat.seatNumber).join(", ")}
                </Text>
              </>
            )}
          </>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.expandButton} onPress={() => toggleExpand(index)}>
            <Text style={styles.expandText}>{isExpanded ? "Hide Details ▲" : "Show Details ▼"}</Text>
          </TouchableOpacity>

                     {pendingAmount > 0 && (
             <TouchableOpacity
               style={styles.payButton}
               onPress={() => handlePayRemaining(item)}
             >
               <Text style={styles.payButtonText}>Pay Remaining</Text>
             </TouchableOpacity>
           )}
        </View>
      </Animated.View>
    );
  };

  const handleBack = () => {
    setBusHistoryData([]);
    setCarHistoryData([]);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "SelectVehicle1" }],
      })
    );
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBack);
    return () => backHandler.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setBusHistoryData([]);
      setCarHistoryData([]);
      if (userId) fetchHistory();
      return () => {
        setBusHistoryData([]);
        setCarHistoryData([]);
      };
    }, [userId])
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleBack}>
          <Icon name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>Booking History</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.toggleButton, selectedType === "bus" && styles.activeButton]}
          onPress={() => setSelectedType("bus")}
        >
          <Icon name="bus" size={18} color="#fff" />
          <Text style={styles.buttonText}>Bus</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, selectedType === "car" && styles.activeButton]}
          onPress={() => setSelectedType("car")}
        >
          <Icon name="car" size={18} color="#fff" />
          <Text style={styles.buttonText}>Car</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.lottieContainer}>
          <LottieView
            source={require("../../assets/loading.json")}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
          />
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {(selectedType === "bus" ? busHistoryData : carHistoryData).length > 0 ? (
            [...(selectedType === "bus" ? busHistoryData : carHistoryData)].reverse().map((item, index) => (
              <View key={index}>{renderCard(item, index)}</View>
            ))
          ) : (
            <Text style={styles.noHistoryText}>No booking history found.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f3f8",
  },
  topBar: {
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  dateText: {
    fontSize: 14,
    marginLeft: 6,
    color: "#555",
    fontWeight: "500",
  },
  
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 12,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 6,
    borderRadius: 20,
  },
  activeButton: {
    backgroundColor: "#FF6B00",
  },
  buttonText: {
    marginLeft: 6,
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  info: {
    fontSize: 14,
    marginLeft: 8,
    color: "#333",
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
  },
  price: {
    fontSize: 14,
    marginLeft: 8,
    color: "#000",
  },
  advance: {
    fontSize: 14,
    marginLeft: 8,
  },
  seatHeader: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 6,
  },
  seatText: {
    fontSize: 14,
    color: "#333",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  expandButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  expandText: {
    color: "#FF6B00",
    fontWeight: "bold",
    fontSize: 14,
  },
  payButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  payButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  noHistoryText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 40,
    color: "#777",
  },
  lottieContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
});

export default History;
