import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

const SelectDateScreen = ({ route: propRoute }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = route.params || {};

  const {
    cityName,
    cityId,
    packageName,
    packageId,
    categoryName,
    categoryId,
    selectedPickupPoint,
    selectedPickupPointId,
    price,
    vehicleType,
    selectedVehicleId,
    selectedBus,
    childWithSeatP,
    childWithoutSeatP,
    destinationId,
    destinationName,
    tuljapur,
  } = routeParams;

  useEffect(() => {
    const fetchDates = async () => {
      if (!packageId) {
        console.error("Package ID is missing");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://newenglishschool-001-site1.ktempurl.com/api/Trip/TripsByPackage/${packageId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (result && result.data) {
          const formattedDates = result.data.map((trip) => ({
            tripId: trip.tripId,
            tripDate: trip.tripDate,
            tourName: trip.tourName,
            totalSeats: trip.totalSeats,
          }));
          setDates(formattedDates);
        } else {
          setDates([]);
        }
      } catch (error) {
        console.error("Error fetching dates:", error);
        setDates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDates();
  }, [packageId]);

  useEffect(() => {
    const backAction = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'SelectVehicle1' }],
      });
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      setSelectedDate(null);
    }, [])
  );

  const handleNextPress = () => {
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    navigation.navigate("SelectSeats", {
      cityName,
      cityId,
      packageName,
      packageId,
      categoryName,
      categoryId,
      selectedPickupPoint,
      selectedPickupPointId,
      price,
      vehicleType,
      selectedVehicleId,
      selectedBus,
      childWithSeatP,
      childWithoutSeatP,
      destinationId,
      destinationName,
      tuljapur,
      selectedDate: selectedDate.tripDate,
      tripId: selectedDate.tripId,
      tourName: selectedDate.tourName,
      totalBusSeats: selectedDate.totalSeats
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.dateRow,
        selectedDate?.tripId === item.tripId && styles.dateRowSelected,
      ]}
      onPress={() => setSelectedDate(item)}
      activeOpacity={0.85}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.tourNameText}>{item.tourName}</Text>
        <View style={styles.infoRow}>
          <Text>📅</Text>
          <Text style={styles.dateText}>{item.tripDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text>🚌</Text>
          <Text style={styles.seatsText}>Total Seats: {item.totalSeats}</Text>
        </View>
      </View>
      <View
        style={[
          styles.radioCircle,
          selectedDate?.tripId === item.tripId && styles.radioCircleSelected,
        ]}
      >
        {selectedDate?.tripId === item.tripId && (
          <View style={styles.radioInner} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'SelectVehicle1' }],
            });
          }}
          style={styles.backButtonContainer}
        >
          <View style={styles.backButtonCircle}>
            <Text style={styles.backButton}>{"<"}</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.headerText}>Select a Date</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF5722" style={{ flex: 1 }} />
      ) : dates.length === 0 ? (
        <View style={styles.noDatesContainer}>
          <Text style={styles.noDatesText}>No dates available</Text>
        </View>
      ) : (
        <FlatList
          data={dates}
          keyExtractor={(item) => item.tripId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity
        style={[
          styles.nextButton,
          { opacity: selectedDate ? 1 : 0.5 },
        ]}
        onPress={handleNextPress}
        disabled={!selectedDate}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF5722",
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  backButtonContainer: {
    marginRight: 10,
  },

  backButtonCircle: {
    backgroundColor: "#fff",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  backButton: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF5722",
  },

  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
    marginRight: 30,
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  dateRow: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    shadowColor: "#FF5722",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  dateRowSelected: {
    backgroundColor: "#FFF3E6",
    borderColor: "#FF5722",
    shadowOpacity: 0.18,
    elevation: 6,
  },

  dateText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 2,
    marginLeft: 4,
  },
  tourNameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF5722",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  seatsText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  noDatesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  noDatesText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#888",
  },

  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#bbb",
    justifyContent: "center",
    alignItems: "center",
  },

  radioCircleSelected: {
    borderColor: "#FF5722",
  },

  radioInner: {
    width: 10,
    height: 10,
    backgroundColor: "#FF5722",
    borderRadius: 5,
  },

  nextButton: {
    position: "absolute",
    bottom: 50,
    left: 30,
    right: 30,
    backgroundColor: "#FF5722",
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});

export default SelectDateScreen;
