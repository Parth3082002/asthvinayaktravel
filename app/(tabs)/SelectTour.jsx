import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const PackageSelectionScreen = () => {
  const [selectedPackage, setSelectedPackage] = useState("Standard");
  const [selectedDuration, setSelectedDuration] = useState("1 Night 2 Days");

  const packages = [
    {
      name: "Standard Package",
      details: [
        "Non-AC Bus Transportation",
        "Bhakt Niwas Accommodation",
        "Basic Meal Plan",
      ],
    },
    {
      name: "Deluxe Package",
      details: [
        "AC Bus Transportation",
        "Deluxe Hotel Stay",
        "Full Board Meals",
      ],
    },
    {
      name: "Premium Package",
      details: [
        "AC Bus Transportation",
        "3 Star Hotel Stay",
        "Gourmet Meals",
      ],
    },
  ];

  const durations = ["1 Night 2 Days", "2 Night 3 Days", "Shastrotk"];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Package Details</Text>

        {packages.map((pkg, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.packageContainer,
              selectedPackage === pkg.name && styles.selectedPackage,
            ]}
            onPress={() => setSelectedPackage(pkg.name)}
          >
            <View style={styles.packageHeader}>
              <Icon
                name={selectedPackage === pkg.name ? "checkbox-marked" : "checkbox-blank-outline"}
                size={22}
                color={selectedPackage === pkg.name ? "#007AFF" : "black"}
              />
              <Text style={styles.packageTitle}>{pkg.name}</Text>
            </View>
            {pkg.details.map((detail, i) => (
              <Text key={i} style={styles.packageDetail}>• {detail}</Text>
            ))}
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Duration Option</Text>

        <View style={styles.durationContainer}>
          {durations.map((duration, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.durationButton,
                selectedDuration === duration && styles.selectedDurationButton,
              ]}
              onPress={() => setSelectedDuration(duration)}
            >
              <Text style={styles.durationText}>{duration}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.nextButton}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    height: 50,
    backgroundColor: "#E65100",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  content: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  packageContainer: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPackage: {
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  packageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  packageDetail: {
    fontSize: 14,
    color: "#555",
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CCC",
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#FFF",
  },
  selectedDurationButton: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FD",
  },
  durationText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  nextButton: {
    backgroundColor: "#E65100",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    margin: 15,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PackageSelectionScreen;
