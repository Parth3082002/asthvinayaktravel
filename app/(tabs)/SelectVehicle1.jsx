import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const cars = [
  {
    id: "1",
    name: "Sedan",
    description: "A sedan offers comfort, fuel efficiency, and a smooth ride for travel",
    price: "₹500 per day",
    image: "https://i.imgur.com/L6LQgYh.png", // Replace with correct car image URL
  },
  {
    id: "2",
    name: "Sedan",
    description: "A sedan offers comfort, fuel efficiency, and a smooth ride for travel",
    price: "₹500 per day",
    image: "https://i.imgur.com/DaWv4ab.png", // Replace with correct car image URL
  },
  {
    id: "3",
    name: "Sedan",
    description: "A sedan offers comfort, fuel efficiency, and a smooth ride for travel",
    price: "₹500 per day",
    image: "https://i.imgur.com/DaWv4ab.png", // Replace with correct car image URL
  },
];

const Dashboard = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 20 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Hello,{"\n"}Ganesh Pawar !</Text>
        <Image
          source={{ uri: "https://i.imgur.com/6QZ8zUz.png" }} // Replace with profile image URL
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
      </View>

      {/* Search Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
          borderRadius: 10,
          paddingHorizontal: 10,
          height: 40,
        }}
      >
        <Ionicons name="search" size={20} color="gray" />
        <TextInput placeholder="Search here" style={{ flex: 1, marginLeft: 10 }} />
      </View>

      {/* Filter Tabs */}
      <View style={{ flexDirection: "row", marginTop: 20 }}>
        <TouchableOpacity style={{ marginRight: 15 }}>
          <Text style={{ color: "gray" }}>ALL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginRight: 15, borderBottomWidth: 2, borderBottomColor: "black" }}>
          <Text style={{ fontWeight: "bold" }}>CAR</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={{ color: "gray" }}>BUS</Text>
        </TouchableOpacity>
      </View>

      {/* Most Rented Car Section */}
      <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 20 }}>Most Rented Car</Text>

      {/* Car List */}
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 15,
              marginTop: 15,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 3,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.name}</Text>
              <Text style={{ color: "gray", fontSize: 12 }}>{item.description}</Text>
              <Text style={{ fontWeight: "bold", marginTop: 5 }}>{item.price}</Text>
              <TouchableOpacity
                style={{
                  backgroundColor: "black",
                  paddingVertical: 5,
                  paddingHorizontal: 15,
                  borderRadius: 5,
                  marginTop: 10,
                  alignSelf: "flex-start",
                }}
              >
                <Text style={{ color: "white" }}>Book Now</Text>
              </TouchableOpacity>
            </View>
            <Image source={{ uri: item.image }} style={{ width: 100, height: 60, resizeMode: "contain" }} />
          </View>
        )}
      />
    </View>
  );
};

export default Dashboard;
