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

const SelectDateScreen = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute(); // Access navigation params

  const { packageId } = route.params || {}; // Extract packageId

  useEffect(() => {
    const fetchDates = async () => {
      if (!packageId) {
        console.error("Package ID is missing");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://ashtavinayak.somee.com/api/Trip/TripsByPackage/${packageId}`
        );
        const result = await response.json();
        
        if (result.data) {
          const formattedDates = result.data.map((trip) => ({
            tripId: trip.tripId,
            tripDate: trip.tripDate,
            tourName: trip.tourName, // Additional data if needed
          }));
          setDates(formattedDates);
        }
      } catch (error) {
        console.error("Error fetching dates:", error);
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
        routes: [{ name: "Home" }],
      });
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Reset selectedDate when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setSelectedDate(null);
    }, [])
  );

  const handleNextPress = () => {
    if (selectedDate) {
      navigation.navigate("SelectSeats", {
        ...route.params, // Pass all previous data
        selectedDate: selectedDate.tripDate,
        tripId: selectedDate.tripId, // Pass tripId for future use
      });
    } else {
      alert("Please select a date");
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dateRow}
      onPress={() => setSelectedDate(item)}
    >
      <Text style={styles.dateText}>{item.tripDate}</Text>
      <View
        style={[
          styles.radioCircle,
          selectedDate?.tripId === item.tripId && styles.radioCircleSelected, // Compare by tripId
        ]}
      >
        {selectedDate?.tripId === item.tripId && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonContainer}>
          <View style={styles.backButtonCircle}>
            <Text style={styles.backButton}>{'<'}</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.headerText}>Select Dates</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF5722" style={{ flex: 1 }} />
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
          { backgroundColor: selectedDate ? "#FF5722" : "#FF5722" },
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
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D44206",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
    justifyContent: "center",
  },
  backButtonContainer: {
    marginRight: 10,
  },
  backButtonCircle: {
    backgroundColor: "#FFFFFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 5,
    marginLeft: -100,
  },
  backButton: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  listContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  dateText: {
    fontSize: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
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
    position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#FF5722',
        borderRadius: 5,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SelectDateScreen;
